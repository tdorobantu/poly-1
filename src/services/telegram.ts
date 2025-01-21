import { Telegraf } from "telegraf";

const createTelegramBot = (() => {
  let botInstance: Telegraf | null = null;

  return () => {
    if (!botInstance) {
      const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_API_KEY;
      const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

      if (!TELEGRAM_BOT_TOKEN) {
        throw new Error("TELEGRAM_API_KEY is not set");
      }
      if (!CHAT_ID) {
        throw new Error("CHAT_ID is not set");
      }

      botInstance = new Telegraf(TELEGRAM_BOT_TOKEN);

      // Launch the bot
      botInstance
        .launch()
        .then(() => console.log("Telegram bot started"))
        .catch((err) => console.error("Failed to start Telegram bot:", err));

      // Graceful shutdown
      process.on("SIGINT", () => {
        botInstance!.stop("SIGINT");
        process.exit();
      });

      process.on("SIGTERM", () => {
        botInstance!.stop("SIGTERM");
        process.exit();
      });
    }

    return {
      bot: botInstance,
      sendMessage: (message: string) => {
        botInstance?.telegram
          .sendMessage(process.env.TELEGRAM_CHAT_ID, message)
          .catch((err) =>
            console.error("Failed to send Telegram message:", err)
          );
      },
    };
  };
})();

export default createTelegramBot;
