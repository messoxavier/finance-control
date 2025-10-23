"use client";

import { useEffect, useState } from "react";

export default function ApiTestPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/health")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <pre style={{ padding: 24 }}>
      {JSON.stringify(data, null, 2) || "Carregando..."}
    </pre>
  );
}
