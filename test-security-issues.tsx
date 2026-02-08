// Test file with security vulnerabilities for workflow testing

// Issue 1: SQL Injection vulnerability
export function getUserById(id: string) {
  const query = `SELECT * FROM users WHERE id = ${id}`;
  return executeQuery(query);
}

// Issue 2: XSS vulnerability - dangerouslySetInnerHTML
export function DisplayHTML({ content }: { content: string }) {
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}

// Issue 3: Hardcoded credentials
export const API_CONFIG = {
  apiKey: 'sk-1234567890abcdef',
  password: 'admin123',
  secret: 'my-secret-key'
};

// Issue 4: Command injection vulnerability
export function executeCommand(userInput: string) {
  const command = `ls -la ${userInput}`;
  return exec(command);
}

// Issue 5: Missing error handling
export async function fetchUserData(userId: string) {
  const response = await fetch(`/api/users/${userId}`);
  return response.json(); // No error handling
}

declare function executeQuery(query: string): any;
declare function exec(command: string): any;
