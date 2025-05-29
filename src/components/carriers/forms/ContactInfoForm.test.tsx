
import { describe, it, expect, beforeAll } from "vitest";
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactInfoForm } from "./ContactInfoForm";
import { useForm } from "react-hook-form";
import { CarrierFormValues } from "../CarrierDetailsForm";
import '@testing-library/jest-dom';

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
    const { getByLabelText } = renderForm();
    expect(getByLabelText(/Primary Contact Name/i)).toBeInTheDocument();
    expect(getByLabelText(/Primary Contact Email/i)).toBeInTheDocument();
    expect(getByLabelText(/Primary Contact Phone/i)).toBeInTheDocument();
  });
  
  it("shows validation error for empty name after blur", async () => {
    const user = userEvent.setup();
    const { getByLabelText, findByText } = renderForm();
    const input = getByLabelText(/Primary Contact Name/i);
    await user.click(input);
    await user.tab();
    expect(await findByText(/Primary contact name required/i)).toBeInTheDocument();
  });
});
