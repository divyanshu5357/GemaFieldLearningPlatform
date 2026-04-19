/**
 * ANIMATION INTEGRATION EXAMPLES
 * 
 * Quick reference patterns for integrating animations into existing pages.
 * These show the minimal changes needed to add animations to your components.
 */

export const ANIMATION_PATTERNS = {
  // Pattern 1: Full page with page transition
  fullPage: `
    import { PageTransition, StaggerContainer, StaggerItem } from "@/lib/animationComponents";
    
    export const MyPage = () => (
      <PageTransition>
        <div className="p-6">
          <h1>Page Title</h1>
          <StaggerContainer className="grid grid-cols-3 gap-4">
            {items.map(item => (
              <StaggerItem key={item.id}>
                <div className="bg-gray-800 p-4 rounded-lg">{item.name}</div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </PageTransition>
    );
  `,

  // Pattern 2: Clickable cards with animations
  animatedCards: `
    import { StaggerContainer, StaggerItem, AnimatedCard } from "@/lib/animationComponents";
    
    export const CardGrid = ({ items }) => (
      <StaggerContainer className="grid grid-cols-3 gap-4">
        {items.map(item => (
          <StaggerItem key={item.id}>
            <AnimatedCard
              onClick={() => handleSelect(item.id)}
              className="cursor-pointer bg-gray-800 p-4 rounded-lg"
            >
              {item.content}
            </AnimatedCard>
          </StaggerItem>
        ))}
      </StaggerContainer>
    );
  `,

  // Pattern 3: Loading skeleton
  skeleton: `
    import { SkeletonLoader } from "@/lib/animationComponents";
    
    export const DataDisplay = ({ isLoading, data }) => (
      <>
        {isLoading ? (
          <SkeletonLoader count={3} className="h-32 rounded-lg mb-4" />
        ) : (
          <div>{data}</div>
        )}
      </>
    );
  `,

  // Pattern 4: Button animations
  buttons: `
    import { AnimatedButton } from "@/lib/animationComponents";
    
    export const ButtonGroup = () => (
      <div className="flex gap-4">
        <AnimatedButton
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-600 rounded-lg"
        >
          Submit
        </AnimatedButton>
        <AnimatedButton
          onClick={handleCancel}
          className="px-6 py-2 bg-gray-600 rounded-lg"
        >
          Cancel
        </AnimatedButton>
      </div>
    );
  `,

  // Pattern 5: Progress bars
  progressBar: `
    import { AnimatedProgressBar } from "@/lib/animationComponents";
    
    export const ProgressDisplay = ({ value }) => (
      <AnimatedProgressBar
        value={value}
        label="Course Progress"
        className="mb-4"
      />
    );
  `,

  // Pattern 6: Score counters
  counter: `
    import { AnimatedCounter } from "@/lib/animationComponents";
    
    export const ScoreDisplay = ({ xp }) => (
      <div className="text-4xl font-bold">
        <AnimatedCounter to={xp} suffix=" XP" duration={1} />
      </div>
    );
  `,

  // Pattern 7: Success notifications
  notifications: `
    import { AnimatedNotification } from "@/lib/animationComponents";
    import { AnimatePresence } from "framer-motion";
    
    export const NotificationDisplay = ({ message }) => (
      <AnimatePresence>
        {message && (
          <AnimatedNotification className="fixed top-4 right-4 bg-green-600 p-4 rounded-lg">
            {message}
          </AnimatedNotification>
        )}
      </AnimatePresence>
    );
  `,

  // Pattern 8: Modal dialogs
  modal: `
    import { AnimatedModal } from "@/lib/animationComponents";
    
    export const ConfirmDialog = ({ isOpen, onClose }) => (
      <AnimatedModal isOpen={isOpen} onClose={onClose}>
        <div className="bg-gray-900 p-8 rounded-lg w-96">
          <h2 className="text-xl font-bold mb-4">Confirm</h2>
          <button onClick={onClose}>Close</button>
        </div>
      </AnimatedModal>
    );
  `,

  // Pattern 9: Pulsing indicators
  pulse: `
    import { AnimatedPulse } from "@/lib/animationComponents";
    
    export const LiveIndicator = () => (
      <div className="flex items-center gap-2">
        <AnimatedPulse>
          <span className="text-red-500 text-lg">●</span>
        </AnimatedPulse>
        <span>Live</span>
      </div>
    );
  `,

  // Pattern 10: List with animation
  list: `
    import { StaggerContainer, StaggerItem } from "@/lib/animationComponents";
    
    export const AnimatedList = ({ items }) => (
      <StaggerContainer className="space-y-2">
        {items.map(item => (
          <StaggerItem key={item.id}>
            <div className="bg-gray-800 p-4 rounded">{item.name}</div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    );
  `,
};

/**
 * INTEGRATION CHECKLIST
 * 
 * When adding animations to a page, follow these steps:
 * 
 * 1. Import components at top:
 *    import { PageTransition, StaggerContainer, ... } from "@/lib/animationComponents";
 * 
 * 2. Wrap page with <PageTransition>
 * 
 * 3. Wrap lists/grids with <StaggerContainer className="...">
 * 
 * 4. Wrap individual items with <StaggerItem>
 * 
 * 5. Replace card divs with <AnimatedCard>
 * 
 * 6. Replace buttons with <AnimatedButton>
 * 
 * 7. Add <AnimatedProgressBar> for progress
 * 
 * 8. Use <SkeletonLoader> for loading states
 * 
 * 9. Wrap notifications in <AnimatePresence>
 * 
 * 10. Test in browser and adjust timing as needed
 */

/**
 * COMPONENT FEATURES AT A GLANCE
 * 
 * PageTransition:
 * - Fade in + slide up on page load
 * - Duration: 0.6s
 * - Use: Wrap entire page component
 * 
 * StaggerContainer + StaggerItem:
 * - Staggered appearance of list items
 * - Duration: 0.5s per item, 0.1s stagger
 * - Use: Lists, grids, card collections
 * 
 * AnimatedCard:
 * - Scale 3% on hover, 2% on tap
 * - Duration: 0.4s
 * - Use: Any card/tile component
 * 
 * AnimatedButton:
 * - Scale 5% on hover, 5% on tap
 * - Duration: 0.2s
 * - Use: All buttons
 * 
 * AnimatedProgressBar:
 * - Smooth width fill animation
 * - Duration: 1.2s
 * - Use: Progress displays
 * 
 * AnimatedCounter:
 * - Smooth number increment
 * - Customizable duration
 * - Use: Scores, XP, streak days
 * 
 * AnimatedNotification:
 * - Slide in from right, fade
 * - Duration: 0.4s
 * - Use: Toast/alert messages
 * 
 * AnimatedModal:
 * - Backdrop fade + content scale
 * - Duration: 0.4s
 * - Use: Dialogs, confirmations
 * 
 * SkeletonLoader:
 * - Shimmer animation
 * - Duration: 2s loop
 * - Use: Loading states
 * 
 * AnimatedPulse:
 * - Continuous opacity pulse
 * - Duration: 2s infinite
 * - Use: Attention grabbers
 * 
 * HoverScale:
 * - Simple scale on hover
 * - Customizable scale factor
 * - Use: Images, thumbnails
 * 
 * SlideIn:
 * - Slide from left or right
 * - Optional delay
 * - Use: Sequential reveals
 */

/**
 * TIMING GUIDELINES
 * 
 * Page Load: 0.6s (smooth but fast)
 * Card Hover: 0.3-0.4s (snappy)
 * Button: 0.2s (instant feedback)
 * List Stagger: 0.1s between items (not overwhelming)
 * Progress Bar: 1.2s (has time to watch)
 * Counter: 0.8-1s (visible count up)
 * Notification: 0.4s (gets attention)
 * Loading Skeleton: 2s (infinite loop)
 * 
 * General Rule: Shorter is snappier, longer feels heavy
 * Keep under 1s except for counters and progress bars
 */

export const QUICK_START = `
1. Install Framer Motion: npm install framer-motion
2. Import components where needed
3. Wrap components using the patterns above
4. Test animations at normal speed
5. Adjust timing if needed (edit src/lib/animations.ts)
6. Deploy and enjoy!

For full documentation, see: ANIMATIONS_GUIDE.md
`;

export default ANIMATION_PATTERNS;
