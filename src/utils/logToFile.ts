import fs from "fs";
import path from "path";

const logToFile = async (filePath: string, message: string): Promise<void> => {
  try {
    // Ensure directory exists
    const directory = path.dirname(filePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    // Create a timestamp
    const timestamp = new Date().toLocaleString("en-US", { timeZone: "UTC" });

    // Format the message
    const logEntry = `[${timestamp}] ${message}\n`;

    // Append the message to the file
    fs.appendFileSync(filePath, logEntry, "utf8");
  } catch (error) {
    console.error("❌ Error logging to file:", error);
  }
};

// Example usage

export default logToFile;
