import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation, useNavigate } from "react-router-dom";
import "./styles.css";

// Font Awesome imports
import { library } from "@fortawesome/fontawesome-svg-core";
import { faHome, faTasks, faDoorOpen, faBolt, faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
library.add(faHome, faTasks, faDoorOpen, faBolt, faUsers);

// Sound effects (using Web Audio API)
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();

const createSound = (type, frequency, duration) => {
  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
};

const playBootSound = () => {
  createSound("sine", 200, 0.5);
  setTimeout(() => createSound("sine", 300, 0.5), 200);
  setTimeout(() => createSound("sine", 400, 0.5), 400);
};

const playBeepSound = () => {
  createSound("square", 800, 0.05);
};

const playClickSound = () => {
  createSound("sine", 600, 0.1);
};

const playDingSound = () => {
  createSound("sine", 1000, 0.3);
  setTimeout(() => createSound("sine", 1200, 0.3), 100);
};

// App Context for shared state
const AppContext = createContext();

const mockFitData = { steps: 7500, workoutMinutes: 20, sleepHours: 6.5 };
const classes = ["Tank", "Assassin", "Mage", "Healer"];
const avatarStages = ["E-Rank Weakling", "C-Rank Shadow", "S-Rank Monarch"];
const motivations = [
  "Rise, Hunter!",
  "Conquer the Shadows!",
  "Become the Monarch!",
  "Defeat the Gates!",
  "Unleash Your Power!"
];

const introText = "In a world overrun by gates and monsters, you are nothing—an E-Rank Hunter, the weakest of the weak. The System has chosen you. Will you rise from the shadows, or fade into oblivion?";
const awakenText = "A blinding light engulfs you... You awaken.";
const nameText = "Hunter, what is your name? Choose your path?";

// App Component (Root)
export default function App() {
  const [xp, setXp] = useState(21);
  const [level, setLevel] = useState(1);
  const [hunterClass, setHunterClass] = useState(null);
  const [hunterName, setHunterName] = useState("");
  const [mana, setMana] = useState(100);
  const [gateActive, setGateActive] = useState(false);
  const [gateProgress, setGateProgress] = useState(0);
  const [completedQuests, setCompletedQuests] = useState([]);
  const [streak, setStreak] = useState(2);
  const [shadowAwakened, setShadowAwakened] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [awakenFlash, setAwakenFlash] = useState(false);
  const [namePhase, setNamePhase] = useState(false);
  const [timeLeft, setTimeLeft] = useState(86377); // 23h 59m 37s
  const [systemMessage, setSystemMessage] = useState("");
  const [systemMessageText, setSystemMessageText] = useState("");
  const [bootComplete, setBootComplete] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [shadowArmy, setShadowArmy] = useState([]);
  const [equipment, setEquipment] = useState([
    { name: "Iron Sword", power: 10, equipped: false },
    { name: "Leather Armor", power: 5, equipped: false }
  ]);
  const [friends, setFriends] = useState([
    { name: "Hunter A", level: 3, streak: 5, shadows: 2 },
    { name: "Hunter B", level: 2, streak: 3, shadows: 1 }
  ]);

  // Calculate total power from Shadow Army and equipped items
  const totalPower = shadowArmy.reduce((sum, shadow) => sum + shadow.power, 0) +
    equipment.reduce((sum, item) => sum + (item.equipped ? item.power : 0), 0);

  // Typewriter effect for intro
  useEffect(() => {
    if (!introComplete && !hunterClass && !namePhase) {
      let i = 0;
      const type = () => {
        if (i < introText.length) {
          setCurrentText(introText.slice(0, i + 1));
          i++;
          setTimeout(type, 50);
        } else {
          setTimeout(() => setShowModal(true), 1000);
        }
      };
      type();
    }
  }, [introComplete, hunterClass, namePhase]);

  // Typewriter effect for awaken and name phase
  useEffect(() => {
    if (namePhase && !hunterClass) {
      let i = 0;
      const type = () => {
        if (i < (awakenFlash ? nameText.length : awakenText.length)) {
          setCurrentText((awakenFlash ? nameText : awakenText).slice(0, i + 1));
          i++;
          setTimeout(type, 50);
        }
      };
      type();
    }
  }, [namePhase, awakenFlash, hunterClass]);

  // Typewriter effect for system messages with sound
  useEffect(() => {
    if (systemMessage) {
      let i = 0;
      const type = () => {
        if (i < systemMessage.length) {
          setSystemMessageText(systemMessage.slice(0, i + 1));
          playBeepSound();
          i++;
          setTimeout(type, 30);
        }
      };
      type();
    }
  }, [systemMessage]);

  // Flash transition after "Yes"
  const handleAwaken = () => {
    setShowModal(false);
    setAwakenFlash(true);
    setTimeout(() => {
      setAwakenFlash(false);
      setNamePhase(true);
    }, 1000);
  };

  // Boot-up sequence
  useEffect(() => {
    if (hunterClass && !bootComplete) {
      playBootSound();
      setTimeout(() => {
        setBootComplete(true);
        setTutorialStep(1); // Start tutorial after boot-up
        setSystemMessage("System: Welcome, Hunter U.");
      }, 3000);
    }
  }, [hunterClass, bootComplete]);

  // Main game logic
  useEffect(() => {
    if (!hunterClass) return;

    const sleep = mockFitData.sleepHours;
    const newMana = sleep < 6 ? 50 : sleep >= 8 ? 120 : 100;
    setMana(newMana);

    const quests = [
      { name: "Scout the Perimeter", goal: 5000, current: mockFitData.steps, xp: 10, type: "steps" },
      { name: "Slay the Dungeon Boss", goal: 30, current: mockFitData.workoutMinutes, xp: 50, type: "workout" },
      { name: "Rest at the Inn", goal: 7, current: mockFitData.sleepHours, xp: 20, type: "sleep" },
    ];

    let completedToday = false;
    quests.forEach((quest) => {
      let achieved = false;
      if (quest.type === "steps" && mockFitData.steps >= quest.goal) achieved = true;
      if (quest.type === "workout" && mockFitData.workoutMinutes >= quest.goal) achieved = true;
      if (quest.type === "sleep" && mockFitData.sleepHours >= quest.goal) achieved = true;

      if (achieved && !completedQuests.includes(quest.name)) {
        setSystemMessage(`System: ${quest.name} completed! +${quest.xp} XP`);
        playDingSound();
        const adjustedXp = Math.round(quest.xp * (newMana / 100) * (1 + streak * 0.1));
        setXp((prev) => {
          const newXp = prev + adjustedXp;
          if (newXp >= level * 100) {
            setLevel((prevLevel) => {
              const newLevel = prevLevel + 1;
              setSystemMessage(`System: Level Up! Rank: Level ${newLevel}`);
              if (newLevel === 10) setGateActive(true);
              if (newLevel === 20) setShadowAwakened(true);
              return newLevel;
            });
          }
          return newXp;
        });
        setCompletedQuests((prev) => [...prev, quest.name]);
        completedToday = true;
      }
    });

    if (completedToday) setStreak((prev) => prev + 1);

    if (gateActive) {
      // Adjust steps with totalPower multiplier (e.g., 1% bonus per power point)
      const effectiveSteps = mockFitData.steps * (1 + totalPower / 100);
      setGateProgress(Math.round(effectiveSteps));
      if (effectiveSteps >= 15000) {
        setSystemMessage("System: Gate Cleared! +100 XP");
        setXp((prev) => prev + 100);
        setGateActive(false);
        setGateProgress(0);
      }
    } else if (level >= 10 && !gateActive) {
      setTimeout(() => {
        setGateActive(true);
        setSystemMessage("System: Gate Spawned! Prepare for battle.");
      }, 5000);
    }

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [gateActive, completedQuests, level, hunterClass]);

  // Shadow Army summoning
  const summonShadow = () => {
    if (shadowArmy.length < 3) {
      const newShadow = {
        name: `Shadow Soldier ${shadowArmy.length + 1}`,
        level: 1,
        power: 5
      };
      setShadowArmy([...shadowArmy, newShadow]);
      setSystemMessage(`System: Summoned ${newShadow.name}!`);
    } else {
      setSystemMessage("System: Shadow Army limit reached.");
    }
  };

  // Equip/Unequip item
  const toggleEquip = (index) => {
    const newEquipment = [...equipment];
    newEquipment[index].equipped = !newEquipment[index].equipped;
    setEquipment(newEquipment);
    setSystemMessage(`System: ${newEquipment[index].equipped ? "Equipped" : "Unequipped"} ${newEquipment[index].name}.`);
  };

  // Add friend
  const addFriend = (friendName) => {
    if (friendName.trim()) {
      setFriends([...friends, { name: friendName, level: 1, streak: 0, shadows: 0 }]);
      setSystemMessage(`System: Added ${friendName} as a friend!`);
    }
  };

  // Intro screen with modal
  if (!introComplete && !hunterClass && !namePhase) {
    return (
      <div className="app onboarding">
        <div className="shadow-overlay"></div>
        <div className="intro-text">{currentText}</div>
        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <h2>Awaken?</h2>
              <button className="modal-button yes" onClick={handleAwaken}>
                Yes
              </button>
              <button
                className="modal-button cancel"
                onClick={() => alert("You fade into oblivion. Goodbye.")}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Awaken flash and name/class selection
  if (namePhase && !hunterClass) {
    return (
      <div className={`app onboarding ${awakenFlash ? "flash" : ""}`}>
        <div className="shadow-overlay"></div>
        <div className="intro-text">{currentText}</div>
        {!awakenFlash && (
          <div className="name-form">
            <input
              type="text"
              value={hunterName}
              onChange={(e) => setHunterName(e.target.value)}
              placeholder="Enter your name"
              className="name-input"
            />
            <div className="class-picker">
              {classes.map((c) => (
                <button
                  key={c}
                  className="class-button"
                  onClick={() => {
                    if (hunterName.trim()) setHunterClass(c);
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Boot-up screen
  if (!bootComplete) {
    return (
      <div className="boot-screen">
        <div className="boot-text">System Initializing...</div>
        <div className="loading-bar">
          <div className="loading-fill"></div>
        </div>
      </div>
    );
  }

  return (
    <AppContext.Provider
      value={{
        xp,
        setXp,
        level,
        setLevel,
        hunterClass,
        hunterName,
        mana,
        gateActive,
        gateProgress,
        completedQuests,
        setCompletedQuests,
        streak,
        shadowAwakened,
        timeLeft,
        systemMessage,
        setSystemMessage,
        systemMessageText,
        tutorialStep,
        setTutorialStep,
        shadowArmy,
        setShadowArmy,
        summonShadow,
        equipment,
        toggleEquip,
        friends,
        addFriend,
        avatarStages,
        totalPower
      }}
    >
      <Router>
        <div className={`app ${level >= 50 ? "monarch" : ""}`}>
          <div className="shadow-overlay">
            <div className="grid-overlay"></div>
            <div className="particles"></div>
          </div>
          {systemMessage && (
            <div className="system-message">
              <span>{systemMessageText}</span>
            </div>
          )}
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/daily-tasks" element={<DailyTasksPage />} />
            <Route path="/gates" element={<GatesPage />} />
            <Route path="/power-ups" element={<PowerUpsPage />} />
            <Route path="/friends" element={<FriendsPage />} />
          </Routes>
          <nav className="bottom-nav">
            <NavLink to="/" className="nav-item">
              <FontAwesomeIcon icon="home" />
              <span>Home</span>
            </NavLink>
            <NavLink to="/daily-tasks" className="nav-item">
              <FontAwesomeIcon icon="tasks" />
              <span>Tasks</span>
            </NavLink>
            <NavLink to="/gates" className="nav-item">
              <FontAwesomeIcon icon="door-open" />
              <span>Gates</span>
            </NavLink>
            <NavLink to="/power-ups" className="nav-item">
              <FontAwesomeIcon icon="bolt" />
              <span>Power-Ups</span>
            </NavLink>
            <NavLink to="/friends" className="nav-item">
              <FontAwesomeIcon icon="users" />
              <span>Friends</span>
            </NavLink>
          </nav>
          {tutorialStep > 0 && tutorialStep <= 5 && (
            <TutorialOverlay />
          )}
        </div>
      </Router>
    </AppContext.Provider>
  );
}

// Home Page
function HomePage() {
  const { hunterName, level, xp, mana, streak, avatarStages, shadowAwakened } = useContext(AppContext);
  const avatarStage = Math.min(Math.floor((level - 1) / 10), avatarStages.length - 1);

  return (
    <div className="page">
      <div className="motivation-ticker">
        <div className="ticker-content">
          {motivations.map((msg, index) => (
            <span key={index}>{msg} &nbsp;&nbsp;&nbsp;</span>
          ))}
          {motivations.map((msg, index) => (
            <span key={`repeat-${index}`}>{msg} &nbsp;&nbsp;&nbsp;</span>
          ))}
        </div>
      </div>
      <h1 className="title">Slit – {hunterName}</h1>
      <div className="hunter-card">
        <div className={`avatar avatar-${avatarStage}`}>
          <div className="avatar-shadow"></div>
          <div className="avatar-eyes"></div>
          {shadowAwakened && <div className="avatar-aura"></div>}
          <span>{avatarStages[avatarStage]}</span>
        </div>
        <div className="stats">
          <p className="rank">Rank: <span>Level {level}</span></p>
          <div className="stat-bar">
            <span>Power:</span>
            <div className="bar"><div className="fill" style={{ width: `${(xp % 100) / 100 * 100}%` }}></div></div>
            <span>{xp}/{level * 100} XP</span>
          </div>
          <div className="stat-bar">
            <span>Mana:</span>
            <div className="bar"><div className="fill" style={{ width: `${mana}%` }}></div></div>
            <span>{mana}%</span>
          </div>
          <div className="stat-bar">
            <span>Streak:</span>
            <div className="bar"><div className="fill" style={{ width: `${Math.min(streak * 10, 100)}%` }}></div></div>
            <span>{streak} Days</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Daily Tasks Page
function DailyTasksPage() {
  const { timeLeft, completedQuests, setCompletedQuests } = useContext(AppContext);
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const quests = [
    { name: "Scout the Perimeter", goal: 5000, current: mockFitData.steps, xp: 10, type: "steps" },
    { name: "Slay the Dungeon Boss", goal: 30, current: mockFitData.workoutMinutes, xp: 50, type: "workout" },
    { name: "Rest at the Inn", goal: 7, current: mockFitData.sleepHours, xp: 20, type: "sleep" },
  ];

  return (
    <div className="page">
      <div className="quest-board">
        <h2 className="section-title">Daily Missions</h2>
        <p className="timer">Time Left: {hours}h {minutes}m {seconds}s</p>
        <ul>
          {quests.map((quest) => (
            <li key={quest.name} className={completedQuests.includes(quest.name) ? "completed" : ""}>
              <div className="quest-panel">
                <span className="quest-icon">⚔️</span>
                <div className="quest-details">
                  <span>{quest.name}</span>
                  <span>{quest.current}/{quest.goal} {quest.type === "steps" ? "steps" : quest.type === "workout" ? "min" : "hrs"}</span>
                </div>
                <div className="quest-progress">
                  <svg viewBox="0 0 36 36" className="progress-ring">
                    <path
                      className="ring-background"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="ring-fill"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      strokeDasharray={`${(quest.current / quest.goal) * 100}, 100`}
                    />
                  </svg>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Gates Page
function GatesPage() {
  const { gateActive, gateProgress, setSystemMessage, totalPower } = useContext(AppContext);
  const effectiveSteps = mockFitData.steps * (1 + totalPower / 100);

  return (
    <div className="page">
      <h2 className="section-title">Gates</h2>
      {gateActive ? (
        <div className="gate-portal">
          <div className="gate-vortex"></div>
          <h3 className="section-title">Blue Gate</h3>
          <p>Threat: {Math.round(effectiveSteps)}/15000 steps</p>
          <p>Total Power: {totalPower} (Steps Multiplier: x{(1 + totalPower / 100).toFixed(2)})</p>
          <div className="gate-ring">
            <svg viewBox="0 0 36 36" className="gate-progress">
              <path
                className="gate-background"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="gate-fill"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                strokeDasharray={`${(effectiveSteps / 15000) * 100}, 100`}
              />
            </svg>
          </div>
        </div>
      ) : (
        <p>No active gates. Check back at Level 10!</p>
      )}
      <div className="community-quests">
        <h3 className="section-title">Community Quests</h3>
        <p>Coming soon: Join forces with friends to tackle massive gates!</p>
      </div>
    </div>
  );
}

// Power-Ups Page (Shadow Army + Equipment)
function PowerUpsPage() {
  const { shadowArmy, summonShadow, equipment, toggleEquip } = useContext(AppContext);

  return (
    <div className="page">
      <div className="shadow-army">
        <h2 className="section-title">Shadow Army</h2>
        {shadowArmy.length === 0 ? (
          <p>No shadows summoned yet.</p>
        ) : (
          <ul>
            {shadowArmy.map((shadow, index) => (
              <li key={index} className="shadow-soldier">
                <span>{shadow.name} (Lv. {shadow.level})</span>
                <span>Power: {shadow.power}</span>
              </li>
            ))}
          </ul>
        )}
        <button className="summon-button" onClick={summonShadow}>Summon Shadow</button>
      </div>
      <div className="equipment">
        <h2 className="section-title">Equipment</h2>
        <ul>
          {equipment.map((item, index) => (
            <li key={index} className={`equipment-item ${item.equipped ? "equipped" : ""}`}>
              <span>{item.name} (+{item.power} Power)</span>
              <button className="equip-button" onClick={() => toggleEquip(index)}>
                {item.equipped ? "Unequip" : "Equip"}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Friends Page
function FriendsPage() {
  const { friends, addFriend } = useContext(AppContext);
  const [newFriendName, setNewFriendName] = useState("");

  return (
    <div className="page">
      <h2 className="section-title">Friends</h2>
      <div className="add-friend">
        <input
          type="text"
          value={newFriendName}
          onChange={(e) => setNewFriendName(e.target.value)}
          placeholder="Enter friend's name"
          className="name-input"
        />
        <button
          className="summon-button"
          onClick={() => {
            addFriend(newFriendName);
            setNewFriendName("");
          }}
        >
          Add Friend
        </button>
      </div>
      <ul className="friends-list">
        {friends.map((friend, index) => (
          <li key={index} className="friend-item">
            <span>{friend.name}</span>
            <span>Level: {friend.level}</span>
            <span>Streak: {friend.streak} Days</span>
            <span>Shadows: {friend.shadows}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Tutorial Overlay
function TutorialOverlay() {
  const { tutorialStep, setTutorialStep } = useContext(AppContext);
  const location = useLocation();
  const navigate = useNavigate(); // Use useNavigate for navigation

  // Redirect to the correct page for each tutorial step without reloading
  useEffect(() => {
    if (tutorialStep === 1 && location.pathname !== "/") navigate("/");
    if (tutorialStep === 2 && location.pathname !== "/daily-tasks") navigate("/daily-tasks");
    if (tutorialStep === 3 && location.pathname !== "/gates") navigate("/gates");
    if (tutorialStep === 4 && location.pathname !== "/power-ups") navigate("/power-ups");
    if (tutorialStep === 5 && location.pathname !== "/friends") navigate("/friends");
  }, [tutorialStep, location, navigate]);

  return (
    <div className="tutorial-overlay">
      <div className="tutorial-content">
        {tutorialStep === 1 && (
          <>
            <h3>Welcome to the System!</h3>
            <p>This is your Hunter Card. It shows your rank, power, mana, and streak.</p>
            <div className="tutorial-arrow hunter-card-arrow"></div>
          </>
        )}
        {tutorialStep === 2 && (
          <>
            <h3>Daily Missions</h3>
            <p>Complete these missions daily to earn XP. You have until the timer runs out!</p>
            <div className="tutorial-arrow quest-board-arrow"></div>
          </>
        )}
        {tutorialStep === 3 && (
          <>
            <h3>Gates</h3>
            <p>Battle gates to earn rewards. More gates unlock as you level up!</p>
            <div className="tutorial-arrow gates-arrow"></div>
          </>
        )}
        {tutorialStep === 4 && (
          <>
            <h3>Power-Ups</h3>
            <p>Summon shadows and equip items to boost your power!</p>
            <div className="tutorial-arrow power-ups-arrow"></div>
          </>
        )}
        {tutorialStep === 5 && (
          <>
            <h3>Friends</h3>
            <p>Add friends and check their stats to compete or collaborate!</p>
            <div className="tutorial-arrow friends-arrow"></div>
          </>
        )}
        <button
          className="tutorial-button"
          onClick={() => {
            playClickSound();
            setTutorialStep(tutorialStep + 1);
          }}
        >
          {tutorialStep === 5 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
}