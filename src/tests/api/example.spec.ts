import { test, expect } from "@playwright/test";

test.describe("API Testing Examples", () => {
  const baseURL = "https://jsonplaceholder.typicode.com";

  test("should perform GET request and verify response", async ({ request }) => {
    const response = await request.get(`${baseURL}/posts/1`);

    expect(response.status()).toBe(200);

    expect(response.headers()["content-type"]).toContain("application/json");

    const body = await response.json();
    expect(body).toHaveProperty("id", 1);
    expect(body).toHaveProperty("title");
    expect(body).toHaveProperty("body");
    expect(body).toHaveProperty("userId");

    expect(typeof body.id).toBe("number");
    expect(typeof body.title).toBe("string");
  });

  test("should perform POST request to create a resource", async ({ request }) => {
    const newPost = {
      title: "Test Post",
      body: "This is a test post body",
      userId: 1,
    };

    const response = await request.post(`${baseURL}/posts`, {
      data: newPost,
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body).toHaveProperty("id");
    expect(body.title).toBe(newPost.title);
    expect(body.body).toBe(newPost.body);
    expect(body.userId).toBe(newPost.userId);
  });

  test("should perform PUT request to update a resource", async ({ request }) => {
    const updatedPost = {
      id: 1,
      title: "Updated Post Title",
      body: "Updated post body content",
      userId: 1,
    };

    const response = await request.put(`${baseURL}/posts/1`, {
      data: updatedPost,
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.title).toBe(updatedPost.title);
    expect(body.body).toBe(updatedPost.body);
  });

  test("should perform PATCH request for partial update", async ({ request }) => {
    const partialUpdate = {
      title: "Partially Updated Title",
    };

    const response = await request.patch(`${baseURL}/posts/1`, {
      data: partialUpdate,
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.title).toBe(partialUpdate.title);
    expect(body).toHaveProperty("body");
    expect(body).toHaveProperty("userId");
  });

  test("should perform DELETE request", async ({ request }) => {
    const response = await request.delete(`${baseURL}/posts/1`);

    expect(response.status()).toBe(200);
  });

  test("should handle query parameters", async ({ request }) => {
    const response = await request.get(`${baseURL}/posts`, {
      params: {
        userId: 1,
        _limit: 5,
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);

    body.forEach((post: any) => {
      expect(post.userId).toBe(1);
    });

    expect(body.length).toBeLessThanOrEqual(5);
  });

  test("should verify response headers", async ({ request }) => {
    const response = await request.get(`${baseURL}/posts/1`);

    expect(response.headers()["content-type"]).toContain("application/json");
    expect(response.headers()).toHaveProperty("date");
  });

  test("should handle authentication headers", async ({ request }) => {
    const response = await request.get("https://httpbin.org/bearer", {
      headers: {
        Authorization: "Bearer test-token-12345",
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.authenticated).toBe(true);
    expect(body.token).toBe("test-token-12345");
  });

  test("should handle error responses (404)", async ({ request }) => {
    const response = await request.get(`${baseURL}/posts/99999`);

    expect(response.status()).toBe(404);
  });

  test("should handle error responses (400)", async ({ request }) => {
    const response = await request.post(`${baseURL}/posts`, {
      data: {
        invalidField: "test",
      },
      headers: {
        "Content-Type": "application/json",
      },
    });

    expect([200, 201, 400]).toContain(response.status());
  });

  test("should verify response time", async ({ request }) => {
    const startTime = Date.now();

    const response = await request.get(`${baseURL}/posts/1`);

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    expect(responseTime).toBeLessThan(5000);
    expect(response.status()).toBe(200);
  });

  test("should handle multiple sequential requests", async ({ request }) => {
    const postsResponse = await request.get(`${baseURL}/posts`);
    const posts = await postsResponse.json();

    const firstPostId = posts[0].id;

    const commentsResponse = await request.get(`${baseURL}/posts/${firstPostId}/comments`);
    const comments = await commentsResponse.json();

    expect(Array.isArray(comments)).toBe(true);
    if (comments.length > 0) {
      expect(comments[0]).toHaveProperty("postId", firstPostId);
    }
  });

  test("should handle JSON response validation", async ({ request }) => {
    const response = await request.get(`${baseURL}/users/1`);

    const user = await response.json();

    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("name");
    expect(user).toHaveProperty("username");
    expect(user).toHaveProperty("email");
    expect(user).toHaveProperty("address");
    expect(user).toHaveProperty("phone");
    expect(user).toHaveProperty("website");
    expect(user).toHaveProperty("company");

    expect(user.address).toHaveProperty("street");
    expect(user.address).toHaveProperty("city");
    expect(user.address).toHaveProperty("zipcode");
  });

  test("should test API with custom headers", async ({ request }) => {
    const response = await request.get("https://httpbin.org/headers", {
      headers: {
        "X-Custom-Header": "test-value",
        "User-Agent": "Playwright-Test-Agent",
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.headers["X-Custom-Header"]).toBe("test-value");
  });
});
