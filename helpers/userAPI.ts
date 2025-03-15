import { APIRequestContext } from '@playwright/test';
import { User } from './types';
import { getToken } from './token';

// Helper function to create a user

/**
  * @param request: APIRequestContext - The Playwright test context for API requests
  * @param userData: any - The user data to be created
  * @returns: Promise<{ status: number, data: CreateUserResponse }> - The status code and data from the response
 */
export async function createUser(request: APIRequestContext, userData: User) {
  const response = await request.post('users', {
    data: userData,
    headers: {
      'Authorization': `Bearer ${getToken()}`, // Access the API token from the .env file
    },
  });

  return {
    status: response.status(),
    data: await response.json() as User
  };
}

// Helper function to get a user by ID
export async function getUser(request: APIRequestContext, userId: number) {
  const response = await request.get(`users/${userId}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`, // Access the API token from the .env file
    },
  });
  return {
    status: response.status(),
    data: await response.json() as User
  }; // Returns the user data from the response
}

export async function getUsers(request: APIRequestContext) {
  const response = await request.get(`users`, {
    headers: {
      'Authorization': `Bearer Invalid token`, 
    },
  });
  return {
    status: response.status(),
    data: await response.json()
  }; // Returns the user data from the response
}
// without token
export async function createUsersWithoutAuthorizationToken(request: APIRequestContext, body: User) {
  const response = await request.post(`users`);
  return {
    status: response.status(),
    data: await response.json()
  }; // Returns the user data from the response
}

// Helper function to update a user
export async function updateUser(request: APIRequestContext, userId: number, userData: Partial<User>) {
  const response = await request.put(`users/${userId}`, {
    data: userData,
    headers: {
      'Authorization': `Bearer ${getToken()}`, // Access the API token from the .env file
    },
  });

  return {
    status: response.status(),
    data: await response.json() as User
  }; // Returns the updated user data from the response
}

// Helper function to delete a user
export async function deleteUser(request: APIRequestContext, userId: number) {
  const response = await request.delete(`users/${userId}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`, // Access the API token from the .env file
    },
  });
  return {
    status: response.status()
  }; // Returns the status code (e.g., 204 for no content)
}
