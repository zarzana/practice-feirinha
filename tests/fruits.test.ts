import httpStatus from "http-status";
import { app } from "../src/index";
import supertest from "supertest";

const server = supertest(app);

describe("POST /fruits", () => {
  it("should return status 201 when adding a fruit", async () => {
    const { status } = await server.post('/fruits').send({ name: 'mirtilo', price: 20 });
    expect(status).toBe(httpStatus.CREATED);
  });

  it("should return status 409 when adding an already registered fruit", async () => {
    const fruit = { name: 'mirtilo', price: 20 }
    await server.post('/fruits').send(fruit);
    const { status } = await server.post('/fruits').send(fruit);
    expect(status).toBe(httpStatus.CONFLICT);
  });

  it("should return status 422 when adding a fruit with missing data", async () => {
    const { status } = await server.post('/fruits').send({ name: 'banana' });
    expect(status).toBe(httpStatus.UNPROCESSABLE_ENTITY);
  });
});

describe("GET /fruits", () => {
  it("shoud return status 404 when attempting to get non-existant id", async () => {
    const { status } = await server.get('/fruits/999999');
    expect(status).toBe(httpStatus.NOT_FOUND);
  });

  it("should return status 400 for invalid id", async () => {
    const { status } = await server.get('/fruits/abcde');
    expect(status).toBe(httpStatus.BAD_REQUEST);
  });

  it("should return status 200 and a single fruit when given a valid id", async () => {
    const id = 1;
    const fruit = { name: 'mirtilo', price: 20 };
    await server.post('/fruits').send(fruit);
    const { status, body } = await server.get(`/fruits/${id}`);
    expect(status).toBe(httpStatus.OK);
    expect(body).toEqual({ ...fruit, id });
  });

  it("should return status 200 all fruits if no id is given", async () => {
    const fruits = [{ name: 'mirtilo', price: 20 }, { name: 'banana', price: 5 }];
    for (let i = 0; i < fruits.length; i++) { await server.post('/fruits').send(fruits[i]); };
    const { status, body } = await server.get('/fruits');
    expect(status).toBe(httpStatus.OK);
    expect(body).toEqual(fruits.map((f, i) => ({ ...f, id: i + 1 })));
  });
});