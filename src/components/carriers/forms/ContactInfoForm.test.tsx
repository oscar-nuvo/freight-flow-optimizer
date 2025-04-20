
import { describe, it, expect, beforeAll } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContactInfoForm } from "./ContactInfoForm";
import { useForm } from "react-hook-form";
import * as matchers from '@testing-library/jest-dom/matchers';
import { CarrierFormValues } from "../CarrierDetailsForm";

// Add jest-dom matchers
beforeAll(() => {
  expect.extend(matchers);
});

function renderForm() {
  // Using partial CarrierFormValues with just the required fields for the test
  const form = useForm<Partial<CarrierFormValues>>({ 
    defaultValues: {
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      additional_contacts: [],
      primary_notification_channels: []
    }
  });
  return render(<ContactInfoForm form={form} />);
}

describe("ContactInfoForm", () => {
  it("renders the form fields", () => {
    renderForm();
    expect(screen.getByLabelText(/Primary Contact Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Primary Contact Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Primary Contact Phone/i)).toBeInTheDocument();
  });
  it("shows validation error for empty name after blur", async () => {
    renderForm();
    const input = screen.getByLabelText(/Primary Contact Name/i);
    fireEvent.blur(input);
    expect(await screen.findByText(/Primary contact name required/i)).toBeInTheDocument();
  });
});
