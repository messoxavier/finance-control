"use client";

import styled from "styled-components";

const Box = styled.div`
  padding: 24px;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell,
    Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji";
`;

const Title = styled.h1`
  font-size: 28px;
  margin: 0 0 12px;
`;

const Tag = styled.span`
  padding: 4px 8px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  font-size: 12px;
`;

export default function Home() {
  return (
    <Box>
      <Title>Finance Control — Frontend ok ✅</Title>
      <Tag>Next.js + styled-components + TS</Tag>
    </Box>
  );
}
