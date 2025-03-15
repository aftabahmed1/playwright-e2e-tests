import { test, expect } from "@playwright/test";
import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getUsers,
  createUsersWithoutAuthorizationToken,
} from "../../helpers/userAPI"; // Adjust the import path accordingly
import {
  validUserData,
  invalidUserData,
  invalidEmail,
  onlyEmail,
  existedEmail,
} from "../../fixtures/testData";
import { User } from "../../helpers/types";

test.describe("API Tests for Users", () => {
  // Declare a variable for the created user ID
  let createdUserId: number;
  let emailForExistingUser: string;

  test.describe("CRUD for user", () => {
    // Sequential Setup to create user 
    test.beforeAll( async ({ request })=> {
      const randomString = Math.random().toString(36).substring(2, 2 + 10);
      const email = `john.doe${Date.now()+randomString}@gmail.com`;
      const data = { ...validUserData, email };
  
      // Call the createUser function from userAPI.ts
      const { status, data: user } = await createUser(request, data);
  
      createdUserId = user.id as number;
      emailForExistingUser = user.email;
  
      expect(status).toBe(201); // Expect created status code
      expect(user.name).toBe(data.name);
      expect(user.email).toBe(email);
    })
  
    test("should retrieve the user successfully", async ({ request }) => {
      const { name } = validUserData;
      const { status, data: user } = await getUser(request, createdUserId);
      expect(status).toBe(200); // Expect OK status code
      expect(user.id).toBe(createdUserId);
      expect(user.name).toBe(name);
    });
  
    test("should update the user successfully", async ({ request }) => {
      const updatedData: Partial<User> = {
        name: "John Updated",
        email: `john.updated${Date.now()}@gmail.com`,
      };
      
      const { status, data: user } = await updateUser(
        request,
        createdUserId,
        updatedData
      );
      expect(status).toBe(200);
      expect(user.name).toBe(updatedData.name);
      expect(user.email).toBe(updatedData.email);
    });
  
    test("should delete the user successfully", async ({ request }) => {
      const { status } = await deleteUser(request, createdUserId);
  
      expect(status).toBe(204); // Expect no content status code for deletion
    });
  })

  test.describe("Negative API Tests for Users", () => {
    test("should return 401 for Invalid token", async ({ request }) => {
      const { status, data: user } = await getUsers(request);
      expect(status).toBe(401);
      expect(user).toEqual({ message: "Invalid token" });
    });
  
    test("should return 401 for missing authentication token", async ({
      request,
    }) => {
      const email = `john.doe${Date.now()}@gmail.com`;
      const data: User = { ...validUserData, email };
      const { status, data: user } = await createUsersWithoutAuthorizationToken(
        request,
        data
      );
      expect(status).toBe(401);
      expect(user).toEqual({ message: "Authentication failed" });
    });
  
    test("should return 422 for invalid data when creating user", async ({
      request,
    }) => {
      const data: User = invalidUserData;
      const { status, data: user } = await createUser(request, data);
      expect(status).toBe(422); // Unprocessable Entity with status code
      expect(user).toEqual([
        {
          field: "gender",
          message: "can't be blank, can be male of female",
        },
        {
          field: "email",
          message: "is invalid",
        },
      ]); // Unprocessable Entity with empty field and invalid email error message
    });
  
    test("should return 422 bad request for invalid email when creating user", async ({
      request,
    }) => {
      const data: User = invalidEmail;

      const { status, data: user } = await createUser(request, data);
      
      expect(status).toBe(422); // Unprocessable Entity with empty fields error message
      expect(user).toEqual([
        // Email invalid error message is returned
        {
          field: "email",
          message: "is invalid",
        },
      ]);
    });
  
    test("should return validation error for empty fields (name, status and gender)", async ({
      request,
    }) => {
      const email = `john.doe${Date.now()}@gmail.com`;
      const data: User = { ...onlyEmail, email };
  
      // Call the createUser function from userAPI.ts
      const { status, data: user } = await createUser(request, data);
      
      expect(status).toBe(422); // Unprocessable Entity with empty fields error messages
      expect(user).toEqual([
        {
          field: "name",
          message: "can't be blank",
        },
        {
          field: "gender",
          message: "can't be blank, can be male of female",
        },
        {
          field: "status",
          message: "can't be blank",
        },
      ]);
    });
  
    test("should return 422 bad request for email already existing", async ({
      request,
    }) => {
      const data = { ...validUserData, email: existedEmail };
  
      // Call the createUser function from userAPI.ts
      const { status, data: email } = await createUser(request, data);
  
      expect(status).toBe(422); // Unprocessable Entity
      expect(email).toEqual([
        {
          field: "email",
          message: "has already been taken",
        },
      ]);
    });
  
    test("should return 404 for non-existent user", async ({ request }) => {
      const invalidUserId = 999999;
      const { status, data: user } = await getUser(request, invalidUserId);

      expect(status).toBe(404); // Expect OK status code
      expect(user).toEqual({ message: "Resource not found" });
    });
  });
});
