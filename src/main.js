import "./style.css"

const envelope = document.querySelector(".envelope");
const letter = document.querySelector(".letter");

const wait = async (millis) => new Promise((resolve) => setTimeout(resolve, millis))

// const animate = async (element, keyframes, options) => {
//   const animation = element.animate(keyframes, options);
//   animation.finished.then(())
// }

envelope.addEventListener("click", async (event) => {
  envelope.style.pointerEvents = "none";
  envelope.setAttribute("data-flipped", null);
  await wait(500);
  // return;
  envelope.setAttribute("data-open", null);
  await wait(500);
  const letterOutAnimation = letter.animate([
    { transform: "translateY(-110%)" },
  ], {
    duration: 500,
    easing: "ease-out",
    fill: "forwards"
  });
  await letterOutAnimation.finished;
  envelope.parentNode.appendChild(letter)
  envelope.setAttribute("data-hidden", null);
  envelope.removeAttribute("data-open");
  await wait(200);
  const letterInAnimation = letter.animate([
    { transform: "translateY(0)", aspectRatio: 0.7070, overflow: "auto" },
  ], {
    duration: 500,
    easing: "ease-in-out",
    fill: "forwards"
  });
  await letterInAnimation.finished;

})