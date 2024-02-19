import { Context, Input, Telegraf, Telegram } from "telegraf";
import { message } from "telegraf/filters";
import axios from "axios";
import FormData from "form-data";
import * as dotenv from "dotenv";
dotenv.config();

const token = process.env.TELEGRAM_TOKEN || "";
const APIServerURL =
  process.env.API_SERVER || "https://s1.mdkruls.net/storygenerator";

const bot = new Telegraf(token);
const telegram = new Telegram(token);
bot.start((ctx) => {
  ctx.reply("Hello " + ctx.from.first_name + "!");
});

bot.on(message("photo"), async (ctx) => {
  ctx.reply("Please wait...");
  const photo = ctx.message.photo.pop() as any;
  const fileLink = await telegram.getFileLink(photo?.file_id);
  const { href } = fileLink;
  const imageBuffer = await getFile(href);
  const imageResult = await getStory(imageBuffer, ctx.message.caption!);
  ctx.replyWithDocument(Input.fromBuffer(imageResult,`${new Date().valueOf()}.png`),{caption:"Document - High Resolution"})
  ctx.replyWithPhoto(Input.fromBuffer(imageResult,`${new Date().valueOf()}.png`),{caption:'Photo - Standard Web Resolution'})
});


bot.on(message('document'), async(ctx) => {
  ctx.reply("Please wait...");
  const fileLink = await telegram.getFileLink(ctx.message.document.file_id);
  const {href} = fileLink;
  const imageBuffer = await getFile(href);
  const imageResult = await getStory(imageBuffer, ctx.message.caption!);
  ctx.replyWithDocument(Input.fromBuffer(imageResult,`${new Date().valueOf()}.png`),{caption:"Document - High Resolution"})
  ctx.replyWithPhoto(Input.fromBuffer(imageResult,`${new Date().valueOf()}.png`),{caption:'Photo - Standard Web Resolution'})
})
bot.on(message("text"), (ctx) => {});
bot.launch();


const getFile = async (url: string) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return response.data;
};
const getStory = async (image: Buffer, title: string) => {
  let data = new FormData();
  data.append("title", title || '');
  data.append("image", image, "abcdef.jpeg");
  const resp = await axios.post(APIServerURL, data, {
    responseType: "arraybuffer",
  });
  return resp.data;
};
