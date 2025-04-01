"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";

export default function FallingGrapes() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | undefined>(undefined);
  const renderRef = useRef<Matter.Render | undefined>(undefined);

  useEffect(() => {
    // Initialize Matter.js
    const { Engine, Render, Runner, Bodies, Composite, Common } = Matter;

    // Create engine
    const engine = Engine.create({
      gravity: { x: 0, y: 1, scale: 0.001 },
    });
    engineRef.current = engine;

    // Create renderer
    const render = Render.create({
      element: sceneRef.current!,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: "transparent",
      },
    });
    renderRef.current = render;

    // Create ground and walls
    const ground = Bodies.rectangle(
      window.innerWidth / 2,
      window.innerHeight + 50,
      window.innerWidth * 2,
      100,
      {
        isStatic: true,
        render: { fillStyle: "transparent" },
      },
    );

    const leftWall = Bodies.rectangle(
      -50,
      window.innerHeight / 2,
      100,
      window.innerHeight * 2,
      {
        isStatic: true,
        render: { fillStyle: "transparent" },
      },
    );

    const rightWall = Bodies.rectangle(
      window.innerWidth + 50,
      window.innerHeight / 2,
      100,
      window.innerHeight * 2,
      {
        isStatic: true,
        render: { fillStyle: "transparent" },
      },
    );

    Composite.add(engine.world, [ground, leftWall, rightWall]);

    // Run the engine and renderer
    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);

    // Function to create and drop circles
    const createCircle = () => {
      const radius = Common.random(20, 50);
      const circle = Bodies.circle(
        Common.random(radius, window.innerWidth - radius),
        -100,
        radius,
        {
          restitution: 0.6,
          friction: 0.1,
          render: {
            fillStyle: "#5237C9",
          },
        },
      );
      Composite.add(engine.world, circle);
    };

    // Drop circles at intervals
    const dropInterval = setInterval(() => {
      if (document.visibilityState === "visible") {
        createCircle();
      }

      // Stop creating circles after a certain number
      if (engine.world.bodies.length > 30) {
        clearInterval(dropInterval);
      }
    }, 300);

    // Handle window resize
    const handleResize = () => {
      if (render) {
        render.options.width = window.innerWidth;
        render.options.height = window.innerHeight;
        render.canvas.width = window.innerWidth;
        render.canvas.height = window.innerHeight;

        // Update ground and walls
        Matter.Body.setPosition(ground, {
          x: window.innerWidth / 2,
          y: window.innerHeight + 50,
        });

        Matter.Body.setPosition(rightWall, {
          x: window.innerWidth + 50,
          y: window.innerHeight / 2,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      clearInterval(dropInterval);
      window.removeEventListener("resize", handleResize);
      Render.stop(render);
      Runner.stop(runner);
      Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, []);

  return (
    <div ref={sceneRef} className="pointer-events-none fixed inset-0 z-0" />
  );
}
