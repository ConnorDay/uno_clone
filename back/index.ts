import express from "express";
import cors from "cors";

const app = express();
app.use(cors());

app.use(express.json());

const router = express.Router();
router.get("/", async (req, res) => {
    res.json({ message: "it worked" });
});

app.use("/", router);

app.listen(8000, () => console.log("Server has started"));
