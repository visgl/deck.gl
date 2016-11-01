
export default function contentsReducer(state = {}, action) {
  switch(action.type) {
  case 'LOAD_CONTENT':
    return {...state, ...action.payload}
  }
  return state;
}
