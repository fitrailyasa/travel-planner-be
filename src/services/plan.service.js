const httpStatus = require('http-status');
const prisma = require('../../prisma/client');
const ApiError = require('../utils/ApiError');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/config');
const { Groq } = require('groq-sdk');

const createPlan = async (body, userId) => {
  body.startDate = new Date(body.startDate);
  body.endDate = new Date(body.endDate);
  body.budget = Number(body.budget);

  if (body.travelTheme) {
    body.travelTheme = body.travelTheme
      .split(/\s*\/\s*|\s+/)
      .map((theme) => theme.charAt(0).toUpperCase() + theme.slice(1))
      .join('/');
  }

  const days = Math.ceil((body.endDate - body.startDate) / (1000 * 60 * 60 * 24)) + 1;

  const plan = await prisma.travelPlan.create({
    data: {
      userId: userId,
      ...body,
    },
  });

  const planDay = Array.from({ length: days }, (_, index) => ({
    day: index + 1,
    date: new Date(new Date(body.startDate).setDate(body.startDate.getDate() + index)),
    travelPlanId: plan.id,
  }));

  await prisma.travelDay.createMany({
    data: planDay,
  });

  return plan;
};

const getAllPlan = async () => {
  return await prisma.travelPlan.findMany({
    include: {
      travelDay: {
        include: {
          activities: true,
        },
      },
    },
  });
};

const getPlanById = async (planId) => {
  const plan = await prisma.travelPlan.findUnique({
    where: {
      id: planId,
    },
    include: {
      travelDay: {
        orderBy: {
          day: 'asc',
        },
        include: {
          activities: {
            orderBy: {
              createdAt: 'asc',
            },
            include: {
              destination: {
                include: {
                  category: {
                    select: {
                      imageUrl: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return plan;
};

const deletePlan = async (plantId) => {
  return await prisma.travelPlan.delete({
    where: {
      id: plantId,
    },
  });
};

const geminiApiRequest = async (itineraryData) => {
  try {
    const genAI = new GoogleGenerativeAI(config.gemini.key);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = promptText(itineraryData);

    const result = await model.generateContent(prompt);
    const res = JSON.parse(result.response.text());
    return res.result;
  } catch (error) {
    return false;
  }
};

const grokApiRequest = async (itineraryData) => {
  const groq = new Groq({
    apiKey: config.groq.key,
  });
  const prompt = promptText(itineraryData);

  const result = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    model: 'llama3-70b-8192',
  });
  const data = JSON.parse(result.choices[0]?.message?.content || '');
  return data.result;
};

const createItinerary = async (planId) => {
  const plan = await getPlanById(planId);
  const itineraryData = {
    city: plan.city,
    duration: plan.travelDay.length,
    travelCompanion: plan.travelCompanion,
    budget: plan.budget,
    travelTheme: plan.travelTheme,
  };

  let data = await geminiApiRequest(itineraryData);
  if (!data) {
    data = await grokApiRequest(itineraryData);
  }

  const categoryNames = [
    ...new Set(
      Object.values(data)
        .flat()
        .map((d) => d.kategori)
    ),
  ];

  const categories = await prisma.category.findMany({
    where: { name: { in: categoryNames } },
  });
  const travelDays = plan.travelDay;

  const categoryMap = Object.fromEntries(categories.map((c) => [c.name, c.id]));
  const travelDayMap = Object.fromEntries(travelDays.map((td) => [td.day, td.id]));

  const destinations = [];
  const activities = [];

  Object.entries(data).forEach(([key, destinationsList]) => {
    const dayNumber = parseInt(key.replace('day', ''), 10);
    const travelDayId = travelDayMap[dayNumber];

    destinationsList.forEach(({ nama_tempat, deskripsi, alamat, kategori }) => {
      if (!categoryMap[kategori]) return;

      const destinationId = `temp-${nama_tempat}`;
      destinations.push({
        id: destinationId,
        placeName: nama_tempat,
        description: deskripsi,
        address: alamat,
        categoryId: categoryMap[kategori],
      });

      activities.push({
        travelDayId,
        destinationId,
      });
    });
  });

  await prisma.destination.createMany({
    data: destinations.map(({ id, ...d }) => d),
  });

  const newDestinations = await prisma.destination.findMany({
    where: {
      placeName: { in: destinations.map((d) => d.placeName) },
    },
  });

  const destinationMap = Object.fromEntries(newDestinations.map((d) => [d.placeName, d.id]));

  const finalActivities = activities.map((a) => ({
    ...a,
    destinationId: destinationMap[a.destinationId.replace('temp-', '')],
  }));

  await prisma.activity.createMany({ data: finalActivities });

  return data;
  // for (const key in data) {
  //   for (const destinations of data[key]) {
  //     const { nama_tempat, deskripsi, alamat, kategori } = destinations;
  //     const dayNumber = parseInt(key.replace('day', ''), 10);

  //     const category = await prisma.category.findFirst({
  //       where: {
  //         name: kategori,
  //       },
  //     });

  //     if (!category) {
  //       continue;
  //     }

  //     const destination = await prisma.destination.create({
  //       data: {
  //         placeName: nama_tempat,
  //         description: deskripsi,
  //         address: alamat,
  //         categoryId: category.id,
  //       },
  //     });

  //     const travelDay = await prisma.travelDay.findFirst({
  //       where: {
  //         day: dayNumber,
  //         travelPlanId: planId,
  //       },
  //     });

  //     await prisma.activity.create({
  //       data: {
  //         travelDayId: travelDay.id,
  //         destinationId: destination.id,
  //       },
  //     });
  //   }
  // }
};

const addDestinationToPlan = async (body) => {
  return await prisma.activity.create({
    data: {
      destinationId: body.destinationId,
      travelDayId: body.travelDayId,
    },
  });
};

const deleteDestinationFromPlan = async (activityId) => {
  return await prisma.activity.delete({
    where: {
      id: activityId,
    },
  });
};

const promptText = (itineraryData) => {
  return `berikan saya itenerary untuk ke kota ${itineraryData.city} bersama ${itineraryData.travelCompanion} saya. dengan budget ${itineraryData.budget} berikan saya itinerary yang cukup selama ${itineraryData.duration} hari. berikan saya ide destinasi dari masing masing kategori ${itineraryData.travelTheme}/kuliner . destinasi perharinya harus diawali dengan makan pagi dan diakhiri dengan makan malam. aktivitasnya harus yang masuk akal untuk setiap harinya seperti tidak ada kegiatan yang bertabrakan, misalnya tidak menggabungkan kunjungan ke pantai dan waterboom pada hari yang sama. Saya juga ingin urutan tempat yang logis untuk dikunjungi, misalnya pada hari pertama: mengunjungi tempat A, dilanjutkan ke tempat B, lalu makan di tempat C. destinasi di 1 harinya jangan terlalu jauh jaraknya dan bisa dikunjungi dari pagi hingga malam. kirim dengan format string seperti dibawah ini,  your entire response/output is going to consist of a single string object {}, and you will NOT wrap it within JSON md markers.
  {
  "result": {
    "day1": [
      {
        "nama_tempat": "string", bener bener nama tempat sesuai tempatnya namanya apa,
        "deskripsi": "string", hal yang bisa dilakukan disini
        "kategori": "kirim namanya sesuai salah satu antara ${itineraryData.travelTheme}/kuliner",
        "alamat": "alamat tempat"
      }
    ],
    dan seterusnya sampai day ${itineraryData.duration}
  }
}

  kirim response dalam bahasa indonesia,
  Jangan menambahkan penjelasan atau teks lain di luar format yang diminta.`;
};

module.exports = {
  createPlan,
  getAllPlan,
  getPlanById,
  deletePlan,
  createItinerary,
  addDestinationToPlan,
  deleteDestinationFromPlan,
};
