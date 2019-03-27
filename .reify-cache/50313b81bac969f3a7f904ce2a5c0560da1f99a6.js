"use strict";module.export({inheritsFrom:()=>inheritsFrom});// Check if one JavaScript class inherits from another
function inheritsFrom(Type, ParentType) {
  while (Type) {
    if (Type === ParentType) {
      return true;
    }
    Type = Object.getPrototypeOf(Type);
  }
  return false;
}
