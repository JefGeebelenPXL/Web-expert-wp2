const dotenv = require("dotenv");
dotenv.config();
const {MongoClient} = require("mongodb");
const {MongoMemoryServer} = require("mongodb-memory-server");
const request = require("supertest");
const mongoose = require("mongoose");

const loadExpress = require("../../loaders/express.js");
const CORS_OPTIONS = JSON.parse(process.env.CORS_OPTIONS);

const {usersIncludingPasswords, admin, tasks} = require("./data");

let mongoServer, client, app;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {});
    app = loadExpress(CORS_OPTIONS);
    client = new MongoClient(uri);
    await client.connect();
});

afterAll(async () => {
    await mongoose.connection.close();
    await client.close();
    await mongoServer.stop();
});

beforeEach(async () => {
    const db = client.db(mongoose.connection.db.databaseName);
    await db.dropDatabase();
    await db.collection('users').insertMany(
        [...usersIncludingPasswords, admin].map((u) => ({
            _id: u._id,
            username: u.username,
            roles: u.roles,
            hashedPassword: u.hashedPassword
        }))
    );
    await db.collection('tasks').insertMany(tasks);
});

// logt in en geeft de token terug
async function login({username, password}) {
    const response = await request(app)
        .post("/security/login")
        .send({username, password});
    const cookie = response.headers['set-cookie'].pop().split(';')[0];
    return cookie.substring(6);
}

describe("admin", () => {

    describe("GET /admin/tasks", () => {
        it("should return 401 when no token is provided", async () => {
            await request(app).get("/admin/tasks").expect(401);
        });

        it("should return 403 when a regular user requests it", async () => {
            const token = await login(usersIncludingPasswords[0]);
            await request(app)
                .get("/admin/tasks")
                .set("Cookie", [`token=${token}`])
                .expect(403);
        });

        it("should return 200 and all tasks for an admin", async () => {
            const token = await login(admin);
            const response = await request(app)
                .get("/admin/tasks")
                .set("Cookie", [`token=${token}`])
                .expect(200);
            const actualIds = response.body.map((t) => t._id).sort();
            const expectedIds = tasks.map((t) => t._id).sort();
            expect(actualIds).toEqual(expectedIds);
        });
    });

    describe("GET /admin/users", () => {
        it("should return 401 when no token is provided", async () => {
            await request(app).get("/admin/users").expect(401);
        });

        it("should return 403 when a regular user requests it", async () => {
            const token = await login(usersIncludingPasswords[0]);
            await request(app)
                .get("/admin/users")
                .set("Cookie", [`token=${token}`])
                .expect(403);
        });

        it("should return 200 and all users without passwords for an admin", async () => {
            const token = await login(admin);
            const response = await request(app)
                .get("/admin/users")
                .set("Cookie", [`token=${token}`])
                .expect(200);
            expect(response.body).toHaveLength(usersIncludingPasswords.length + 1);
            response.body.forEach((u) => {
                expect(u.hashedPassword).toBeUndefined();
            });
        });
    });

    describe("PATCH /admin/tasks/:taskId/assign", () => {
        const taskWithoutUser = tasks.find((t) => !t.userId);
        const user = usersIncludingPasswords[1];

        it("should return 401 when no token is provided", async () => {
            await request(app)
                .patch(`/admin/tasks/${taskWithoutUser._id}/assign`)
                .send({userId: user._id})
                .expect(401);
        });

        it("should return 403 when a regular user tries to assign", async () => {
            const token = await login(usersIncludingPasswords[0]);
            await request(app)
                .patch(`/admin/tasks/${taskWithoutUser._id}/assign`)
                .set("Cookie", [`token=${token}`])
                .send({userId: user._id})
                .expect(403);
        });

        it("should return 200 and the assigned task for an admin", async () => {
            const token = await login(admin);
            const response = await request(app)
                .patch(`/admin/tasks/${taskWithoutUser._id}/assign`)
                .set("Cookie", [`token=${token}`])
                .send({userId: user._id})
                .expect(200);
            expect(response.body.userId).toBe(user._id);
        });

        it("should return 400 for an invalid userId", async () => {
            const token = await login(admin);
            await request(app)
                .patch(`/admin/tasks/${taskWithoutUser._id}/assign`)
                .set("Cookie", [`token=${token}`])
                .send({userId: "abc"})
                .expect(400);
        });

        it("should return 404 when the user does not exist", async () => {
            const token = await login(admin);
            await request(app)
                .patch(`/admin/tasks/${taskWithoutUser._id}/assign`)
                .set("Cookie", [`token=${token}`])
                .send({userId: "11111111-1111-4111-8111-111111111111"})
                .expect(404);
        });

        it("should return 404 when the task does not exist", async () => {
            const token = await login(admin);
            await request(app)
                .patch(`/admin/tasks/11111111-1111-4111-8111-111111111111/assign`)
                .set("Cookie", [`token=${token}`])
                .send({userId: user._id})
                .expect(404);
        });
    });
});
