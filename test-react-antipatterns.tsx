// Test file with React anti-patterns for workflow testing
import React, { useState, useEffect } from 'react';

// Issue 1: Missing dependency in useEffect
export function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(data => setUser(data));
  }, []); // Missing userId dependency

  return <div>{user?.name}</div>;
}

// Issue 2: Unnecessary useEffect for derived state
export function ProductList({ products }) {
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const sum = products.reduce((acc, p) => acc + p.price, 0);
    setTotal(sum);
  }, [products]);

  return <div>Total: {total}</div>;
}
