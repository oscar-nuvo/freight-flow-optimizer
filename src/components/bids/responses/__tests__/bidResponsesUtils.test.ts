
import { filterLatestCarrierResponses } from "../bidResponsesUtils";

describe("filterLatestCarrierResponses", () => {
  it("returns only the latest response per carrier by submitted_at", () => {
    const responses = [
      { id: "1", carrier_id: "A", submitted_at: "2024-05-01T10:00:00Z", version: 1 },
      { id: "2", carrier_id: "A", submitted_at: "2024-06-01T10:00:00Z", version: 2 }, // later
      { id: "3", carrier_id: "B", submitted_at: "2024-05-01T11:00:00Z", version: 1 },
      { id: "4", carrier_id: "B", submitted_at: "2024-04-01T12:00:00Z", version: 1 }, // earlier
      { id: "5", carrier_id: "C", submitted_at: "2024-07-01T10:00:00Z", version: 5 }
    ];
    const filtered = filterLatestCarrierResponses(responses);
    expect(filtered).toHaveLength(3);
    expect(filtered.find(r => r.carrier_id === "A")!.id).toBe("2");
    expect(filtered.find(r => r.carrier_id === "B")!.id).toBe("3");
    expect(filtered.find(r => r.carrier_id === "C")!.id).toBe("5");
  });

  it("uses version when submitted_at is identical or missing", () => {
    const responses = [
      { id: "1", carrier_id: "A", submitted_at: null, version: 1 },
      { id: "2", carrier_id: "A", submitted_at: null, version: 2 }, // latest version
      { id: "3", carrier_id: "A", submitted_at: null, version: 1 },
    ];
    const filtered = filterLatestCarrierResponses(responses);
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe("2");
  });

  it("empty input yields empty output", () => {
    expect(filterLatestCarrierResponses([])).toEqual([]);
  });
});
