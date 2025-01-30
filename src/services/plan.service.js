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
      travelDay: true,
    },
  });

  if (!plan) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Plan not found');
  }

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
  const genAI = new GoogleGenerativeAI(config.gemini.key);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `saya akan jalan jalan ke kota ${itineraryData.city} bersama ${itineraryData.travelCompanion} selama ${itineraryData.duration} hari dengan budget ${itineraryData.budget} berikan saya ide destinasi dari masing masing kategori ${itineraryData.travelTheme} dengan format string seperti dibawah ini,  your entire response/output is going to consist of a single string object {}, and you will NOT wrap it within JSON md markers.
  {
  "result": {
    "day1": [
      {
        "nama_tempat": "string", bener bener nama tempat sesuai tempatnya namanya apa,
        "deskripsi": "string",
        "kategori": "${itineraryData.travelTheme}",
        "alamat": ""
      }
    ],
    dan seterusnya sampai day ${itineraryData.duration}
  }
}

Jangan menambahkan penjelasan atau teks lain di luar format yang diminta.`;

  const result = await model.generateContent(prompt);
  const res = JSON.parse(result.response.text());
  console.log(res.result);
};

const grokApiRequest = async (itineraryData) => {
  const groq = new Groq({
    apiKey: config.grok.key,
  });
  const prompt = `berikan saya itenerary untuk ke kota ${itineraryData.city} bersama ${itineraryData.travelCompanion} selama ${itineraryData.duration} hari dengan budget ${itineraryData.budget} berikan saya ide destinasi dari masing masing kategori ${itineraryData.travelTheme} yang memungkinkan untuk dilakukan pada masing-masing hari, tanpa kegiatan yang bertabrakan atau tidak masuk akal, misalnya tidak ada kegiatan seperti ke pantai dan waterboom di hari yang sama. beri saya itenerary tempat yang bisa dikunjungsi berurutan dari tempat 1 ke tempat selanjutnya misal di day 1 ke tempat a lanjut tempat b makan di tempat c. kirim dengan format string seperti dibawah ini,  your entire response/output is going to consist of a single string object {}, and you will NOT wrap it within JSON md markers.
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

  const data = await grokApiRequest(itineraryData);
  for (const key in data) {
    for (const destinations of data[key]) {
      const { nama_tempat, deskripsi, alamat, kategori } = destinations;
      const dayNumber = parseInt(key.replace('day', ''), 10);

      const category = await prisma.category.findFirst({
        where: {
          name: kategori,
        },
      });

      if (!category) {
        continue;
      }

      const destination = await prisma.destination.create({
        data: {
          placeName: nama_tempat,
          description: deskripsi,
          address: alamat,
          categoryId: category.id,
        },
      });

      const travelDay = await prisma.travelDay.findFirst({
        where: {
          day: dayNumber,
          travelPlanId: planId,
        },
      });

      await prisma.activity.create({
        data: {
          travelDayId: travelDay.id,
          destinationId: destination.id,
        },
      });
    }
  }
};

module.exports = {
  createPlan,
  getAllPlan,
  getPlanById,
  deletePlan,
  createItinerary,
};
