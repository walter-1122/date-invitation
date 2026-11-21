import { Client, TablesDB, ID, Query } from "node-appwrite";

export default async ({ req, res, log, error }) => {
  try {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);

    const tablesDB = new TablesDB(client);

    return res.json({
      success: true,
      message: "Date Invitation API is connected!",
      databaseReady: true
    });
  } catch (err) {
    error(err.message);
    return res.json({
      success: false,
      message: "Server configuration error"
    }, 500);
  }
};
