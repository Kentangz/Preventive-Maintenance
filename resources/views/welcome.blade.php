<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name', 'Laravel') }}</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=space-mono:400,700|space-grotesk:400,500,700" rel="stylesheet" />

    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Space Grotesk', sans-serif;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            color: #e0e0e0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
            position: relative;
        }

        /* Animated background grid */
        body::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image:
                linear-gradient(rgba(255, 0, 0, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 0, 0, 0.03) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: gridMove 20s linear infinite;
            pointer-events: none;
        }

        @keyframes gridMove {
            0% {
                transform: translate(0, 0);
            }

            100% {
                transform: translate(50px, 50px);
            }
        }

        /* Navigation */
        nav {
            padding: 2rem;
            display: flex;
            justify-content: flex-end;
            gap: 1rem;
            position: relative;
            z-index: 10;
        }

        nav a {
            padding: 0.75rem 1.5rem;
            text-decoration: none;
            color: #e0e0e0;
            border: 1px solid rgba(255, 0, 0, 0.3);
            border-radius: 4px;
            transition: all 0.3s ease;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            background: rgba(255, 0, 0, 0.05);
        }

        nav a:hover {
            border-color: #ff0000;
            background: rgba(255, 0, 0, 0.15);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 0, 0, 0.3);
        }

        /* Main content */
        main {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 2rem;
            position: relative;
            z-index: 1;
            text-align: center;
        }

        .glitch-wrapper {
            position: relative;
            margin-bottom: 3rem;
        }

        h1 {
            font-size: clamp(2rem, 8vw, 6rem);
            font-weight: 700;
            line-height: 1.2;
            margin-bottom: 1rem;
            position: relative;
            color: #ffffff;
            text-shadow:
                0 0 10px rgba(255, 0, 0, 0.5),
                0 0 20px rgba(255, 0, 0, 0.3),
                0 0 30px rgba(255, 0, 0, 0.2);
            animation: flicker 3s infinite alternate;
        }

        @keyframes flicker {

            0%,
            100% {
                opacity: 1;
            }

            41.99% {
                opacity: 1;
            }

            42% {
                opacity: 0.8;
            }

            43% {
                opacity: 1;
            }

            45.99% {
                opacity: 1;
            }

            46% {
                opacity: 0.9;
            }

            46.5% {
                opacity: 1;
            }
        }

        .subtitle {
            font-size: clamp(1rem, 3vw, 1.5rem);
            color: #888;
            font-family: 'Space Mono', monospace;
            margin-bottom: 3rem;
            opacity: 0;
            animation: fadeIn 1s ease forwards 0.5s;
        }

        @keyframes fadeIn {
            to {
                opacity: 1;
            }
        }

        .search-container {
            width: 100%;
            max-width: 600px;
            position: relative;
            margin-bottom: 2rem;
        }

        .search-box {
            width: 100%;
            padding: 1.5rem 2rem;
            background: rgba(20, 20, 20, 0.8);
            border: 2px solid rgba(255, 0, 0, 0.3);
            border-radius: 8px;
            color: #e0e0e0;
            font-size: 1.1rem;
            font-family: 'Space Mono', monospace;
            outline: none;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }

        .search-box:focus {
            border-color: #ff0000;
            box-shadow: 0 0 20px rgba(255, 0, 0, 0.3);
            background: rgba(20, 20, 20, 0.95);
        }

        .search-box::placeholder {
            color: #555;
        }

        .quick-links {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            justify-content: center;
            margin-top: 2rem;
        }

        .quick-link {
            padding: 0.75rem 1.5rem;
            background: rgba(255, 0, 0, 0.1);
            border: 1px solid rgba(255, 0, 0, 0.3);
            border-radius: 20px;
            color: #e0e0e0;
            text-decoration: none;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            font-family: 'Space Mono', monospace;
        }

        .quick-link:hover {
            background: rgba(255, 0, 0, 0.2);
            border-color: #ff0000;
            transform: scale(1.05);
        }

        /* Satirical messages */
        .satir-message {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            max-width: 300px;
            padding: 1rem;
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid rgba(255, 0, 0, 0.5);
            border-radius: 4px;
            font-family: 'Space Mono', monospace;
            font-size: 0.85rem;
            color: #ff6666;
            animation: slideIn 0.5s ease;
        }

        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }

            to {
                transform: translateX(0);
                opacity: 1;
            }
        }

        /* Responsive */
        @media (max-width: 768px) {
            nav {
                padding: 1rem;
            }

            .satir-message {
                bottom: 1rem;
                right: 1rem;
                left: 1rem;
                max-width: none;
            }
        }
    </style>
</head>

<body>
    @if (Route::has('login'))
    <nav>
        @auth
        <a href="{{ url('/dashboard') }}">Dashboard</a>
        @else
        <a href="{{ route('login') }}">Log in</a>
        @if (Route::has('register'))
        <a href="{{ route('register') }}">Register</a>
        @endif
        @endauth
    </nav>
    @endif

    <main>
        <div class="glitch-wrapper">
            <h1>Hi, What are you looking for?</h1>
        </div>

        <p class="subtitle">// probably something you won't find here</p>

        <div class="search-container">
            <input
                type="text"
                class="search-box"
                placeholder="Type something... (it won't help)"
                id="searchInput" />
        </div>

        <div class="quick-links">
            <a href="#" class="quick-link">Hope</a>
            <a href="#" class="quick-link">Dreams</a>
            <a href="#" class="quick-link">Purpose</a>
            <a href="#" class="quick-link">Nothing</a>
        </div>
    </main>

    <div class="satir-message">
        <strong>💀 System Message:</strong><br>
        Still searching? That's adorable.
    </div>

    <script>
        // Satirical search responses
        const satirMessages = [
            "Still searching? That's adorable.",
            "404: Expectations not found.",
            "Your search is as empty as this void.",
            "Nice try, but no.",
            "ERROR: Hope.exe has stopped working.",
            "Searching... Found: Nothing. As expected.",
            "Keep typing. It won't matter.",
            "The void stares back at you.",
            "Your query has been filed under 'ignored'."
        ];

        const searchInput = document.getElementById('searchInput');
        const satirMessageEl = document.querySelector('.satir-message');

        searchInput.addEventListener('input', () => {
            if (searchInput.value.length > 3) {
                const randomMessage = satirMessages[Math.floor(Math.random() * satirMessages.length)];
                satirMessageEl.innerHTML = `<strong>💀 System Message:</strong><br>${randomMessage}`;

                // Reset animation
                satirMessageEl.style.animation = 'none';
                setTimeout(() => {
                    satirMessageEl.style.animation = 'slideIn 0.5s ease';
                }, 10);
            }
        });

        // Random message rotation
        setInterval(() => {
            const randomMessage = satirMessages[Math.floor(Math.random() * satirMessages.length)];
            satirMessageEl.innerHTML = `<strong>💀 System Message:</strong><br>${randomMessage}`;
        }, 8000);
    </script>
</body>

</html>