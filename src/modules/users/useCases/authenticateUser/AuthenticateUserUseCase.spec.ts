import { AppError } from "../../../../shared/errors/AppError";
import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let user: ICreateUserDTO;

describe("Authenticate User", () => {
  beforeAll(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(
      usersRepositoryInMemory
    );
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);

    user = {
      email: "user@example.com",
      password: "password",
      name: "test name",
    };

    await createUserUseCase.execute(user);
  });

  it("should be able to authenticate user", async () => {
    const result = await authenticateUserUseCase.execute({
      email: user.email,
      password: user.password,
    });

    expect(result).toHaveProperty("token");
  });

  it("should not be able to authenticate a non-existing user", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: "123",
        password: user.password,
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not be able to authenticate an user with incorrect password", async () => {
    expect(async () => {
      await authenticateUserUseCase.execute({
        email: user.email,
        password: "user.password",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
