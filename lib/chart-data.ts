export const checkComparisonData = (row: Record<string, unknown>): boolean => {
  return Object.keys(row).length > 2;
};

export const transformComparisonData = (rows: Record<string, unknown>[]): Record<string, unknown>[] => {
  const groupingField = inferGroupingField(rows);

  const transformedRows: Record<string, unknown>[] = [];

  for (const upperRow of rows) {
    const relatedRows = rows.filter((row) => row[groupingField] === upperRow[groupingField]);
    const comparisonRow: Record<string, unknown> = {};
    for (const row of relatedRows) {
      comparisonRow[groupingField] = row[groupingField];
      const otherFields = Object.keys(row).filter((key) => key !== groupingField);
      const comparisonField = row[otherFields[0]] as string;
      const metricField = otherFields[1];
      comparisonRow[comparisonField] = row[metricField];
    }
    if (transformedRows.find((row) => row[groupingField] === comparisonRow[groupingField])) continue;
    transformedRows.push(comparisonRow);
  }
  return transformedRows;
};

export const inferGroupingField = (rows: Record<string, unknown>[]): string => {
  const firstRow = rows[0];
  const keys = Object.keys(firstRow);
  keys.pop();

  const record: { [K in "field1" | "field2"]: { seenCount: number; value: unknown; name: string } } = {
    field1: {
      seenCount: 0,
      value: keys ? firstRow[keys[0]] : "",
      name: keys ? keys[0] : "",
    },
    field2: {
      seenCount: 0,
      value: keys ? firstRow[keys[1]] : "",
      name: keys ? keys[1] : "",
    },
  };

  rows.forEach((row: Record<string, unknown>) => {
    if (row[record.field1.name] === record.field1.value) {
      record.field1.seenCount += 1;
    }
    if (row[record.field2.name] === record.field2.value) {
      record.field2.seenCount += 1;
    }
  });

  if (record.field1.seenCount < record.field2.seenCount) return record.field1.name;
  return record.field2.name;
};
