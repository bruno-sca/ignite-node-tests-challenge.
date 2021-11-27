import { AppError } from "../../../../shared/errors/AppError";
import { User } from "../../../users/entities/User";
import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: InMemoryUsersRepository;
let user: User;

let statementsRepositoryInMemory: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

describe("Create Statement", () => {
  beforeAll(async () => {
    usersRepositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory
    );

    user = await createUserUseCase.execute({
      email: "user@example.com",
      password: "password",
      name: "test name",
    });
  });

  it("should create an deposit statement", async () => {
    const statementOperation = await createStatementUseCase.execute({
      user_id: String(user.id),
      type: "deposit" as OperationType,
      amount: 100,
      description: "description",
    });

    expect(statementOperation).toHaveProperty("id");
  });

  it("should create an withdraw statement if user have sufficient funds", async () => {
    const statementOperation = await createStatementUseCase.execute({
      user_id: String(user.id),
      type: "withdraw" as OperationType,
      amount: 75,
      description: "description",
    });

    expect(statementOperation).toHaveProperty("id");
  });

  it("should not create an withdraw statement if user have insufficient funds", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: String(user.id),
        type: "withdraw" as OperationType,
        amount: 75,
        description: "description",
      });
    }).rejects.toBeInstanceOf(AppError);
  });

  it("should not create an statement of a non-existent user", async () => {
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "fake id",
        type: "withdraw" as OperationType,
        amount: 75,
        description: "description",
      });
    }).rejects.toBeInstanceOf(AppError);
    expect(async () => {
      await createStatementUseCase.execute({
        user_id: "fake id",
        type: "deposit" as OperationType,
        amount: 75,
        description: "description",
      });
    }).rejects.toBeInstanceOf(AppError);
  });
});
