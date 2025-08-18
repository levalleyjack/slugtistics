import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import ReactSelect from "react-select";
import { createSelectStyles } from "./reactSelectStyles";

export default function ClassSelection({
  classOptions,
  selectedClass,
  setSelectedClass,
  sortBy,
  setSortBy,
  setSelectedInstructor,
  setSelectedTerm,
  instructorOptions,
  selectedInstructor,
  termOptions,
  selectedTerm,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Class Selection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex-1 min-w-[200px]">
            <ReactSelect
              options={classOptions}
              value={selectedClass}
              onChange={(opt) => {
                setSelectedClass(opt as ClassOption);
                setSelectedInstructor(null);
                setSelectedTerm(null);
              }}
              placeholder="Class"
              styles={createSelectStyles()}
              isClearable={true}
            />
          </div>

          <div className="w-[300px] min-w-[150px]">
            <div className="flex items-center gap-2">
              <ReactSelect
                options={[
                  { value: "instructor", label: "Select by Instructor" },
                  { value: "term", label: "Select by Term" },
                ]}
                value={{
                  value: sortBy,
                  label: `Select by ${sortBy[0].toUpperCase()}${sortBy.slice(
                    1
                  )}`,
                }}
                onChange={(opt) => {
                  setSortBy(opt?.value || "instructor");
                  setSelectedInstructor(null);
                  setSelectedTerm(null);
                }}
                styles={createSelectStyles()}
                className="flex-1"
              />
            </div>
          </div>

          {sortBy === "instructor" ? (
            <div className="w-[300px] min-w-[150px]">
              <ReactSelect
                options={instructorOptions}
                value={
                  selectedInstructor !== null
                    ? instructorOptions.find(
                        (o) => o.value === selectedInstructor
                      )
                    : null
                }
                onChange={(opt) => {
                  const newInstructor = (opt as ClassOption)?.value ?? null;
                  setSelectedInstructor(newInstructor);
                  // Auto-select "All Terms" when instructor is selected
                  setSelectedTerm("");
                }}
                placeholder="Instructor"
                isDisabled={instructorOptions.length === 0}
                styles={createSelectStyles()}
                isClearable={true}
              />
            </div>
          ) : (
            <div className="w-[300px] min-w-[150px]">
              <ReactSelect
                options={termOptions}
                value={
                  selectedTerm !== null
                    ? termOptions.find((o) => o.value === selectedTerm)
                    : null
                }
                onChange={(opt) => {
                  const newTerm = (opt as ClassOption)?.value ?? null;
                  setSelectedTerm(newTerm);
                  // Auto-select "All Instructors" when term is selected
                  setSelectedInstructor("");
                }}
                placeholder="Term"
                isDisabled={termOptions.length === 0}
                styles={createSelectStyles()}
                isClearable={true}
              />
            </div>
          )}

          {sortBy === "instructor" ? (
            <div className="w-[300px] min-w-[150px]">
              <ReactSelect
                options={termOptions}
                value={
                  selectedTerm !== null
                    ? termOptions.find((o) => o.value === selectedTerm)
                    : null
                }
                onChange={(opt) =>
                  setSelectedTerm((opt as ClassOption)?.value ?? null)
                }
                placeholder="Term"
                // Removed the disabling condition - third dropdown is always enabled
                isDisabled={termOptions.length === 0}
                styles={createSelectStyles()}
                isClearable={true}
              />
            </div>
          ) : (
            <div className="w-[300px] min-w-[150px]">
              <ReactSelect
                options={instructorOptions}
                value={
                  selectedInstructor !== null
                    ? instructorOptions.find(
                        (o) => o.value === selectedInstructor
                      )
                    : null
                }
                onChange={(opt) =>
                  setSelectedInstructor((opt as ClassOption)?.value ?? null)
                }
                placeholder="Instructor"
                // Removed the disabling condition - third dropdown is always enabled
                isDisabled={instructorOptions.length === 0}
                styles={createSelectStyles()}
                isClearable={true}
              />
            </div>
          )}

          <div className="flex items-center">
            <Button
              onClick={handleAddClass}
              disabled={!isButtonEnabled}
              variant={isButtonEnabled ? "default" : "muted"}
              size={"addclass"}
            >
              Add Class
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
