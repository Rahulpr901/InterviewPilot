require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const connectDB = require("./config/db");
const routes = require("./routes");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
  console.error(
    "Missing required environment variable: MONGO_URI. Create backend/.env from .env.example.",
  );
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.error(
    "Missing required environment variable: JWT_SECRET. Create backend/.env from .env.example.",
  );
  process.exit(1);
}

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", routes);

app.use(errorHandler);

connectDB().then(() => {
  const server = app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`),
  );

  server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
      console.error(
        `Port ${PORT} is already in use. Stop the other process or set a different PORT in backend/.env.`,
      );
      process.exit(1);
    }

    throw error;
  });
});
