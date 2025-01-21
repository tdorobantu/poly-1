import { Telegraf } from "telegraf";

const getChatId = async () => {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_API_KEY;

  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_API_KEY is not set");
  }

  const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

  console.log("Send a message to your bot to get the chat ID...");

  bot.on("message", (ctx) => {
    const chatId = ctx.chat.id;
    console.log(`Chat ID: ${chatId}`);
    ctx.reply(`Your Chat ID is: ${chatId}`);

    // Stop the bot after retrieving the chat ID
    bot.stop();
    process.exit(0);
  });

  bot
    .launch()
    .then(() => console.log("Telegram bot is running..."))
    .catch((err) => console.error("Failed to launch the bot:", err));

  // Graceful shutdown
  process.on("SIGINT", () => {
    bot.stop("SIGINT");
    process.exit();
  });

  process.on("SIGTERM", () => {
    bot.stop("SIGTERM");
    process.exit();
  });
};

export default getChatId;
