import { test, expect } from '@playwright/test';

test.describe('Todo Page', () => {
    const BASE_URL = 'http://localhost:5173';

    test('should add a new todo and append it to the list', async ({ page }) => {
        // 1. Mock initial empty todo list
        await page.route('**/api/v1/todos', async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ todos: [] }),
                });
            }
        });

        await page.goto(BASE_URL);

        // 2. Mock POST and subsequent GET
        const newTodo = {
            id: 'mock-id-1',
            name: 'Buy milk',
            description: 'Go to the store and buy milk',
            status: false,
        };

        await page.route('**/api/v1/todos', async (route) => {
            const method = route.request().method();
            if (method === 'POST') {
                await route.fulfill({
                    status: 201,
                    contentType: 'application/json',
                    body: JSON.stringify({ todo: newTodo }),
                });
            } else if (method === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ todos: [newTodo] }),
                });
            }
        });

        // 3. User types todo name and description
        await page.getByPlaceholder('Name').fill('Buy milk');
        await page.getByPlaceholder('Description').fill('Go to the store and buy milk');

        // 4. Click the Add Todo button
        await page.getByRole('button', { name: 'Add Todo' }).click()

        // 5. Verify the created todo item appears in the list
        const todoItemName = page.getByRole('heading', { name: 'Buy milk' });
        const todoItemDesc = page.getByText('Go to the store and buy milk');

        await expect(todoItemName).toBeVisible();
        await expect(todoItemDesc).toBeVisible();

        // 6. Verify input fields are cleared
        await expect(page.getByPlaceholder('Name')).toHaveValue('');
        await expect(page.getByPlaceholder('Description')).toHaveValue('');
    });

    test('should disable Add Todo button until both name and description are provided', async ({ page }) => {
        await page.route('**/api/v1/todos', async (route) => {
            if (route.request().method() === 'GET') {
                await route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ todos: [] }),
                });
            }
        });

        await page.goto(BASE_URL);

        const addButton = page.getByRole('button', { name: 'Add Todo' })
        await expect(addButton).toBeDisabled();

        await page.getByPlaceholder('Name').fill('Only Name');
        await expect(addButton).toBeDisabled();

        await page.getByPlaceholder('Name').fill('');
        await page.getByPlaceholder('Description').fill('Only Description');
        await expect(addButton).toBeDisabled();

        await page.getByPlaceholder('Name').fill('Both Provided');
        await expect(addButton).toBeEnabled();
    });
});
