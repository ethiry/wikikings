export enum InstanceOf {
  Unknown,
  Human,
  NobleTitle,
  HistoricalPosition,
}

export enum Statement {
  Unknown,
  InstanceOf,
}

export enum Gender {
  Male = "M",
  Female = "F",
  Unknown = "U",
}

export enum StatementId {
  DateOfBirth = "P569",
  DateOfDeath = "P570",
  Family = "P53",
  Father = "P22",
  Gender = "P21",
  InstanceOf = "P31",
  Mother = "P25",
  Occupation = "P106",
  PositionHeld = "P39",
  Sibling = "P3373",
  Spouse = "P26",
  Child = "P40",
}

export enum QualifierId {
  StartTime = "P580",
  EndTime = "P582",
  Replaces = "P1365",
  ReplacedBy = "P1366",
}

export enum QualifierValue {
  Male = "Q6581097",
  Female = "Q6581072",
  Human = "Q5",
  Monarch = "Q116",
  NobleTitle = "Q355567",
  HistoricalPosition = "Q114962596",
}
