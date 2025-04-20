
import { describe, it, expect } from "vitest";
import { validatePhoneWithCountryCode, getCountryFromCode, isAtLeastOneNotificationChannel, notificationChannels } from "./contactUtils";

describe("contactUtils", () => {
  it("validates US phone", () => {
    expect(validatePhoneWithCountryCode("5551234567", "+1")).toBe(true);
    expect(validatePhoneWithCountryCode("+15551234567", "+1")).toBe(true);
    expect(validatePhoneWithCountryCode("555-123-4567", "+1")).toBe(true);
    expect(validatePhoneWithCountryCode("555", "+1")).toBe(false);
  });
  
  it("validates Mexico phone", () => {
    expect(validatePhoneWithCountryCode("5534567890", "+52")).toBe(true);
    expect(validatePhoneWithCountryCode("+525534567890", "+52")).toBe(true);
    expect(validatePhoneWithCountryCode("123", "+52")).toBe(false);
  });
  
  it("gets country from code", () => {
    expect(getCountryFromCode("+1", "USA")).toBe("USA");
    expect(getCountryFromCode("+1", "Canada")).toBe("Canada");
    expect(getCountryFromCode("+52", undefined)).toBe("Mexico");
    expect(getCountryFromCode("+49", undefined)).toBe("USA");
  });
  
  it("checks notification channels", () => {
    expect(isAtLeastOneNotificationChannel(["sms"])).toBe(true);
    expect(isAtLeastOneNotificationChannel([])).toBe(false);
  });
  
  it("has the expected notification channels", () => {
    expect(notificationChannels).toHaveLength(3);
    expect(notificationChannels.map(c => c.id)).toContain("email");
    expect(notificationChannels.map(c => c.id)).toContain("phone");
    expect(notificationChannels.map(c => c.id)).toContain("sms");
  });
});
