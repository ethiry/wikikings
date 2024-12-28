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
}

export enum StatementId {
  DateOfBirth = "P569",
  DateOfDeath = "P570",
  Father = "P22",
  Mother = "P25",
  Family = "P53",
  InstanceOf = "P31",
  PositionHeld = "P39",
  Gender = "P21",
  Sibling = "P3373",
}

export enum QualifierId {
  StartTime = "P580",
  EndTime = "P582",
  Replaces = "P1365",
  ReplacedBy = "P1366",
}
