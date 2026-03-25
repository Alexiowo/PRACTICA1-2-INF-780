export default async function globalTeardown(): Promise<void> {
  // Connection cleanup is handled by app.close() inside the test suite's afterAll hook.
}
