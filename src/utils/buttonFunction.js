function buttonFunction(type, playerName, setGetName) {
  switch (type) {
    case "quick":
      // Logic for quick match
      if (!playerName) {
        setGetName(true);
      } else {
        console.log("Start Quick Match");
      }
      break;
    case "private":
      // Logic for creating a
      if (!playerName) {
        setGetName(true);
      } else {
        console.log("Create Room");
      }
      break;
    default:
      throw new Error("Unknown button type");
  }
}

export { buttonFunction };
