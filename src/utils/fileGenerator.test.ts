import { generateCode } from "./fileGenerator.js";
import { NamerConfig } from "./configLoader.js";

// 테스트용 기본 설정
const mockConfig: NamerConfig = {
  reactTemplate: "function",
  styleType: "module-css",
  templates: {},
};

describe("코드 생성기 (generateCode)", () => {
  describe("React 컴포넌트 (.tsx)", () => {
    it("기본 설정(function + module-css)대로 컴포넌트를 생성해야 한다", () => {
      const code = generateCode("userProfile", ".tsx", mockConfig);
      expect(code).toContain("export default function UserProfile()");
      expect(code).toContain("import styles from './UserProfile.module.css';");
    });

    it("화살표 함수(arrow) 설정 시 화살표 함수 컴포넌트를 생성해야 한다", () => {
      const arrowConfig: NamerConfig = {
        ...mockConfig,
        reactTemplate: "arrow",
      };
      const code = generateCode("userProfile", ".tsx", arrowConfig);
      expect(code).toContain("const UserProfile = () => {");
      expect(code).toContain("export default UserProfile;");
    });
  });

  describe("TypeScript 로직 (.ts)", () => {
    it("'use'로 시작하면 React Hook 템플릿을 생성해야 한다", () => {
      const code = generateCode("useAuth", ".ts", mockConfig);
      expect(code).toContain("import { useState, useEffect } from 'react';");
      expect(code).toContain("export const useAuth = () => {");
    });

    it("'is'로 시작하면 Boolean 반환 함수를 생성해야 한다", () => {
      const code = generateCode("isValid", ".ts", mockConfig);
      expect(code).toContain("export const isValid = (): boolean => {");
      expect(code).toContain("return true;");
    });

    it("그 외의 경우 일반 함수 스텁을 생성해야 한다", () => {
      const code = generateCode("calculateTotal", ".ts", mockConfig);
      expect(code).toContain("export const calculateTotal = () => {");
      expect(code).toContain("// TODO: Implement calculateTotal");
    });
  });

  describe("스타일 (.css)", () => {
    it("기본 CSS 클래스를 생성해야 한다", () => {
      const code = generateCode("userProfile", ".css", mockConfig);
      expect(code).toContain("/* userProfile styles */");
      expect(code).toContain(".container {");
    });
  });
});
