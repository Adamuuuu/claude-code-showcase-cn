// Test file with TypeScript issues for workflow testing

// Issue 1: Using 'any' type (violates strict mode)
export function processData(data: any) {
  return data.value;
}

// Issue 2: Missing return type
export function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Issue 3: Implicit any in parameters
export function formatUser(user) {
  return `${user.name} - ${user.email}`;
}

// Issue 4: Unused variable
export function fetchData() {
  const unusedVar = "This is never used";
  return fetch('/api/data');
}

// Issue 5: Type assertion without proper checking
export function getUserName(obj: unknown): string {
  return (obj as any).name;
}
