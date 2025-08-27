<!DOCTYPE html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="gameroom.css" />
    <link rel="icon" type="image/x-icon" href="../aset/logo1.png" />
    <title>Game Room - Napza Edu Card</title>
  </head>
  <body>
    <!-- Header Info (Nama dan Skor) -->
    <div class="top-info">
      <div class="player-name"></div> <!-- Diisi JS -->
      <div class="right-info">
        <div class="timer-box"></div> <!-- Diisi JS -->
        <div class="score-box"></div> <!-- Diisi JS -->
      </div>
    </div>

    <!-- Kartu Pertanyaan -->
    <div class="question-card">
      <div class="flower">🌸</div>
      <p></p> <!-- Diisi JS -->
      <div class="flower bottom-flower">🌸</div>
    </div>

    <!-- Jawaban -->
    <div class="answer-grid">
      <button class="answer-btn"></button>
      <button class="answer-btn"></button>
      <button class="answer-btn"></button>
      <button class="answer-btn"></button>
    </div>

    <script src="http://localhost:3000/socket.io/socket.io.js"></script>
    <script src="gameroom.js"></script>
  </body>
</html>
