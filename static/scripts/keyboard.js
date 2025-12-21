let activeHandler = null;
const global_keymap = [
  // will always be available
  {
    key: "1",
    callback: () => window.render_app("review", "pre-review"),
  },
  {
    key: "2",
    callback: () => window.render_app("lookup"),
  },
  {
    key: "3",
    callback: () => window.render_app("lookalike"),
  },
  {
    key: "4",
    callback: () => window.render_app("settings"),
  },
];

export function loadKeymap(shortcuts) {
  if (activeHandler) document.removeEventListener("keydown", activeHandler);
  shortcuts = [...global_keymap, ...shortcuts];

  activeHandler = (e) => {
    for (const shortcut of shortcuts) {
      if (shortcut.key === e.key) {
        e.preventDefault();
        shortcut.callback();
        break;
      }
    }
  };

  document.addEventListener("keydown", activeHandler);
}
document.addEventListener("keydown", activeHandler);
