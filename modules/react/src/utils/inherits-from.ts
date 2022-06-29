// Check if one JavaScript class inherits from another
export function inheritsFrom<T>(Type: any, ParentType: T): Type is T {
  while (Type) {
    if (Type === ParentType) {
      return true;
    }
    Type = Object.getPrototypeOf(Type);
  }
  return false;
}
