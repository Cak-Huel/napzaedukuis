const http = require("http");
const socketio = require("socket.io");
const db = require("./sekret");

const server = http.createServer();
const io = socketio(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Event join room
  socket.on("join_room", ({ kode_room, nama_guest }) => {
    if (!kode_room || !nama_guest) {
      socket.emit("join_result", {
        success: false,
        message: "Kode room dan nama harus diisi.",
      });
      return;
    }

    // cari id_room berdasarkan kode_room
    db.query(
      "SELECT id_room, kode_room FROM room WHERE kode_room = ?",
      [kode_room],
      (err, results) => {
        if (err) {
          console.error("DB select room error:", err);
          socket.emit("join_result", {
            success: false,
            message: "Server error.",
          });
          return;
        }

        if (!results.length) {
          socket.emit("join_result", {
            success: false,
            message: "Kode room tidak ditemukan.",
          });
          return;
        }

        const id_room = results[0].id_room;
        const roomKode = results[0].kode_room;

        // gabung socket ke room agar bisa menerima broadcast
        socket.join(String(id_room));
        console.log(`Socket ${socket.id} joined socket room ${id_room}`);

        // insert peserta ke tabel room_player (asumsikan kolom: id_room, nama_guest, skor, waktu_masuk)
        db.query(
          "INSERT INTO room_player (id_room, nama_guest, skor, waktu_masuk) VALUES (?, ?, 0, NOW())",
          [id_room, nama_guest],
          (err2, res2) => {
            if (err2) {
              console.error("DB insert room_player error:", err2);
              socket.emit("join_result", {
                success: false,
                message: "Gagal menyimpan data peserta.",
              });
              return;
            }

            const id_peserta = res2.insertId;
            console.log(`Inserted peserta ${id_peserta} for room ${id_room}`);

            // kirim hasil ke client yang join
            socket.emit("join_result", { success: true, id_room, id_peserta });

            // kirim update daftar peserta (room_info) ke semua socket di room
            db.query(
              "SELECT nama_guest FROM room_player WHERE id_room = ?",
              [id_room],
              (err3, pemain) => {
                if (err3) {
                  console.error("DB select room_player error:", err3);
                  return;
                }
                const peserta = pemain.map((r) => r.nama_guest);
                io.to(String(id_room)).emit("room_info", {
                  success: true,
                  kode_room: roomKode,
                  peserta,
                  id_room: String(id_room),
                });
              }
            );
          }
        );
      }
    );
  });

  // Request kode room dan peserta
  socket.on("get_room_info", (kode_room) => {
    db.query(
      "SELECT id_room, kode_room FROM room WHERE kode_room=?",
      [kode_room],
      (err, roomRes) => {
        if (err || roomRes.length === 0) {
          socket.emit("room_info", { success: false });
        } else {
          const id_room = roomRes[0].id_room;
          db.query(
            "SELECT nama_guest FROM room_player WHERE id_room=?",
            [id_room],
            (err2, pesertaRes) => {
              const peserta = pesertaRes
                ? pesertaRes.map((p) => p.nama_guest)
                : [];
              socket.emit("room_info", {
                success: true,
                kode_room: roomRes[0].kode_room,
                peserta,
                id_room,
              });
            }
          );
        }
      }
    );
  });

  // Event ambil info room berdasarkan id_room
  // Pastikan client yang membuka participant/waiting_room memanggil ini.
  // Handler ini juga membuat socket masuk ke socket.io room agar bisa menerima broadcast game_started
  socket.on("get_room_info_by_id", (id_room) => {
    console.log(
      "Server received get_room_info_by_id:",
      id_room,
      "from socket:",
      socket.id
    );
    if (!id_room) {
      socket.emit("room_info", { success: false, message: "id_room missing" });
      return;
    }

    db.query(
      "SELECT kode_room FROM room WHERE id_room = ?",
      [id_room],
      (err, roomRes) => {
        console.log("DB result for id_room", id_room, "=>", {
          err: err ? err.message : null,
          rows: roomRes && roomRes.length ? roomRes : [],
        });
        if (err || !roomRes || roomRes.length === 0) {
          console.error("DB select room error:", err);
          socket.emit("room_info", { success: false });
          return;
        }

        // join ke socket room supaya menerima broadcast
        try {
          socket.join(String(id_room));
          console.log(
            `Socket ${socket.id} joined socket room ${id_room} (get_room_info_by_id)`
          );
        } catch (e) {
          console.error("socket.join error:", e);
        }

        db.query(
          "SELECT nama_guest FROM room_player WHERE id_room = ?",
          [id_room],
          (err2, pesertaRes) => {
            if (err2) {
              console.error("DB select room_player error:", err2);
              socket.emit("room_info", { success: false });
              return;
            }
            const peserta = pesertaRes.map((r) => r.nama_guest);
            socket.emit("room_info", {
              success: true,
              kode_room: roomRes[0].kode_room,
              peserta,
              id_room: String(id_room),
            });
          }
        );
      }
    );
  });

  // Handler tombol Mulai pada participant (author)
  socket.on("start_game", (id_room) => {
    console.log("start_game received from", socket.id, "for id_room:", id_room);
    if (!id_room) {
      socket.emit("start_result", {
        success: false,
        message: "id_room missing",
      });
      return;
    }

    // update status di DB (pastikan kolom 'status' bisa menerima nilai 'mulai' atau gunakan VARCHAR)
    db.query(
      "UPDATE room SET status = ? WHERE id_room = ?",
      ["mulai", id_room],
      (err, res) => {
        if (err) {
          console.error("UPDATE room error:", err);
          socket.emit("start_result", {
            success: false,
            message: "DB update failed",
          });
          return;
        }

        // Beri tahu author bahwa start berhasil
        socket.emit("start_result", { success: true });

        // Broadcast ke semua socket yang sudah join ke socket room ini (peserta di waiting room)
        io.to(String(id_room)).emit("game_started", {
          id_room: String(id_room),
        });
        console.log(`Broadcasted game_started to room ${id_room}`);
      }
    );
  });

  // Kirim soal selanjutnya yang belum dijawab peserta di room
  socket.on("get_question", ({ id_room, id_peserta }) => {
    console.log("Sending next question...");
    if (!id_room || !id_peserta) {
      socket.emit("question_data", null);
      return;
    }

    const sqlNext =
      "SELECT sm.* FROM soal_mlt sm WHERE sm.id_room = ? AND sm.id_soalmlt NOT IN (SELECT id_soalmlt FROM jawaban_room WHERE id_peserta = ?) ORDER BY sm.id_soalmlt ASC LIMIT 1";
    db.query(sqlNext, [id_room, id_peserta], (err, rows) => {
      if (err) {
        console.error("DB get next question error:", err);
        socket.emit("question_data", null);
        return;
      }
      if (!rows || rows.length === 0) {
        // tidak ada soal lagi -> beri tahu peserta bahwa permainannya selesai (untuk peserta ini)
        socket.emit("game_ended", {
          id_room: String(id_room),
          reason: "no_more_questions",
        });
        return;
      }
      const q = rows[0];
      socket.emit("question_data", {
        id_soalmlt: q.id_soalmlt,
        pertanyaan: q.pertanyaan,
        jwbn_a: q.jwbn_a,
        jwbn_b: q.jwbn_b,
        jwbn_c: q.jwbn_c,
        jwbn_d: q.jwbn_d,
        skor: q.skor,
      });
    });
  });

  // Terima jawaban, simpan, update skor, lalu kirim soal berikutnya atau game_ended
  socket.on(
    "submit_answer",
    ({ id_peserta, id_soalmlt, jawaban, waktu_jawab }) => {
      console.log("submit_answer received:", {
        id_peserta,
        id_soalmlt,
        jawaban,
      });
      if (!id_peserta || !id_soalmlt) {
        console.warn("submit_answer missing id_peserta or id_soalmlt", {
          id_peserta,
          id_soalmlt,
        });
        return;
      }

      // ambil soal untuk cek benar dan nilai skor
      db.query(
        "SELECT jwbn_benar, skor FROM soal_mlt WHERE id_soalmlt = ?",
        [id_soalmlt],
        (errQ, qrows) => {
          if (errQ || !qrows || qrows.length === 0) {
            console.error("DB select soal error:", errQ);
            return;
          }
          const benarJawaban =
            String(jawaban).trim() === String(qrows[0].jwbn_benar).trim()
              ? 1
              : 0;
          const nilaiSoal = qrows[0].skor || 0;

          // simpan jawaban
          db.query(
            "INSERT INTO jawaban_room (id_peserta, id_soalmlt, jawaban, benar, waktu_jawab) VALUES (?, ?, ?, ?, ?)",
            [id_peserta, id_soalmlt, jawaban, benarJawaban, waktu_jawab],
            (errIns, resIns) => {
              if (errIns) {
                console.error("DB insert jawaban_room error:", errIns);
                // lanjutkan agar client tidak stuck
              } else {
                console.log(
                  "Inserted jawaban_room id:",
                  resIns.insertId,
                  "for peserta:",
                  id_peserta,
                  "soal:",
                  id_soalmlt,
                  "benar:",
                  benarJawaban
                );
              }

              // jika benar -> tambahkan skor ke room_player
              const afterScoreEmit = () => {
                // kirim soal berikutnya untuk peserta yang sama
                const sqlNext =
                  "SELECT sm.* FROM soal_mlt sm WHERE sm.id_room = (SELECT id_room FROM room_player WHERE id_peserta = ?) AND sm.id_soalmlt NOT IN (SELECT id_soalmlt FROM jawaban_room WHERE id_peserta = ?) ORDER BY sm.id_soalmlt ASC LIMIT 1";
                db.query(
                  sqlNext,
                  [id_peserta, id_peserta],
                  (errNext, nextRows) => {
                    if (errNext) {
                      console.error(
                        "DB get next question after submit error:",
                        errNext
                      );
                      socket.emit("next_question"); // coba trigger client untuk meminta lagi
                      return;
                    }
                    if (!nextRows || nextRows.length === 0) {
                      // tidak ada soal lagi untuk peserta -> selesai (untuk peserta ini)
                      socket.emit("game_ended", {
                        id_room: String(id_room),
                        reason: "no_more_questions_after_submit",
                      });
                    } else {
                      const nq = nextRows[0];
                      socket.emit("question_data", {
                        id_soalmlt: nq.id_soalmlt,
                        pertanyaan: nq.pertanyaan,
                        jwbn_a: nq.jwbn_a,
                        jwbn_b: nq.jwbn_b,
                        jwbn_c: nq.jwbn_c,
                        jwbn_d: nq.jwbn_d,
                        skor: nq.skor,
                      });
                    }
                  }
                );
              };

              if (benarJawaban) {
                db.query(
                  "UPDATE room_player SET skor = skor + ? WHERE id_peserta = ?",
                  [nilaiSoal, id_peserta],
                  (errUp) => {
                    if (errUp) console.error("DB update skor error:", errUp);
                    // kirim skor terbaru ke peserta
                    db.query(
                      "SELECT skor FROM room_player WHERE id_peserta = ?",
                      [id_peserta],
                      (errSk, skRes) => {
                        if (!errSk && skRes && skRes.length) {
                          socket.emit("score_update", { skor: skRes[0].skor });
                        }
                        afterScoreEmit();
                      }
                    );
                  }
                );
              } else {
                // jika salah, kirim skor sekarang tanpa perubahan
                db.query(
                  "SELECT skor FROM room_player WHERE id_peserta = ?",
                  [id_peserta],
                  (errSk, skRes) => {
                    if (!errSk && skRes && skRes.length) {
                      socket.emit("score_update", { skor: skRes[0].skor });
                    }
                    afterScoreEmit();
                  }
                );
              }
            }
          );
        }
      );
    }
  );

  // Event untuk mendapatkan scoreboard
  socket.on("get_scoreboard", (id_room) => {
    // Ambil peserta dan skor
    db.query(
      "SELECT id_peserta, nama_guest, skor FROM room_player WHERE id_room=? ORDER BY skor DESC",
      [id_room],
      (err, pesertaRes) => {
        if (err || pesertaRes.length === 0) {
          socket.emit("scoreboard_data", { peserta: [] });
        } else {
          // Ambil semua jawaban peserta
          const pesertaIds = pesertaRes.map((p) => p.id_peserta);
          db.query(
            "SELECT id_peserta, id_soalmlt, benar FROM jawaban_room WHERE id_peserta IN (?) ORDER BY id_soalmlt ASC",
            [pesertaIds],
            (err2, jawabanRes) => {
              // Gabungkan jawaban ke peserta
              pesertaRes.forEach((peserta) => {
                peserta.jawaban = jawabanRes
                  .filter((j) => j.id_peserta === peserta.id_peserta)
                  .map((j) => ({
                    benar: j.benar === 1,
                  }));
              });
              socket.emit("scoreboard_data", { peserta: pesertaRes });
            }
          );
        }
      }
    );
  });

  // Event selesai game
  socket.on("finish_game", (id_room) => {
    // Update status room jadi selesai
    db.query(
      'UPDATE room SET status="selesai" WHERE id_room=?',
      [id_room],
      (err, res) => {
        if (!err) {
          // Kirim notifikasi selesai hanya ke peserta room tersebut
          io.to(String(id_room)).emit("game_ended", {
            id_room: String(id_room),
            reason: "finished_by_server",
          });
        } else {
          console.error("finish_game DB update error:", err);
        }
      }
    );
  });

  // Event untuk mendapatkan detail skor peserta
  socket.on("get_score_detail", async ({ id_room, id_peserta }) => {
    // Ambil data peserta
    db.query(
      "SELECT nama_guest, skor FROM room_player WHERE id_peserta=?",
      [id_peserta],
      (err, pesertaRes) => {
        if (err || pesertaRes.length === 0) return;
        const nama_guest = pesertaRes[0].nama_guest;
        const skor = pesertaRes[0].skor;

        // Total peserta
        db.query(
          "SELECT COUNT(*) AS total FROM room_player WHERE id_room=?",
          [id_room],
          (err2, res2) => {
            const total_peserta = res2[0].total;

            // Ranking
            db.query(
              "SELECT id_peserta FROM room_player WHERE id_room=? ORDER BY skor DESC",
              [id_room],
              (err3, res3) => {
                const ranking =
                  res3.findIndex((p) => p.id_peserta == id_peserta) + 1;

                // Jawaban peserta
                db.query(
                  "SELECT * FROM jawaban_room WHERE id_peserta=? ORDER BY id_soalmlt ASC",
                  [id_peserta],
                  (err4, jawabanRes) => {
                    // Total benar/salah, waktu tercepat, benar beruntun
                    let total_benar = 0,
                      total_salah = 0,
                      waktu_tercepat = 30,
                      benar_beruntun = 0,
                      streak = 0;

                    jawabanRes.forEach((j) => {
                      if (j.benar) {
                        total_benar++;
                        streak++;
                        if (j.waktu_jawab < waktu_tercepat)
                          waktu_tercepat = j.waktu_jawab;
                      } else {
                        total_salah++;
                        streak = 0;
                      }
                      if (streak > benar_beruntun) benar_beruntun = streak;
                    });

                    // Total soal
                    db.query(
                      "SELECT COUNT(*) AS total FROM soal_mlt WHERE id_room=?",
                      [id_room],
                      (err5, soalRes) => {
                        const total_soal = soalRes[0].total;

                        // Review soal
                        db.query(
                          "SELECT s.*, j.jawaban AS jawaban_user, j.benar AS benar_user FROM soal_mlt s LEFT JOIN jawaban_room j ON s.id_soalmlt=j.id_soalmlt AND j.id_peserta=? WHERE s.id_room=? ORDER BY s.id_soalmlt ASC",
                          [id_peserta, id_room],
                          (err6, reviewRes) => {
                            const review = reviewRes.map((r) => ({
                              pertanyaan: r.pertanyaan,
                              jwbn_a: r.jwbn_a,
                              jwbn_b: r.jwbn_b,
                              jwbn_c: r.jwbn_c,
                              jwbn_d: r.jwbn_d,
                              kunci_jawaban: r.jwbn_benar,
                              jawaban_user: r.jawaban_user,
                              benar_user: r.benar_user == 1,
                            }));

                            socket.emit("score_detail", {
                              nama_guest,
                              skor,
                              total_peserta,
                              ranking,
                              total_benar,
                              total_salah,
                              waktu_tercepat,
                              benar_beruntun,
                              total_soal,
                              review,
                            });
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  });

  // Event untuk mengakhiri game dan menandai room sebagai selesai
  socket.on("end_game", (id_room) => {
    if (!id_room) {
      socket.emit("end_result", { success: false, message: "id_room missing" });
      return;
    }

    db.query(
      "UPDATE room SET status = ? WHERE id_room = ?",
      ["selesai", id_room],
      (err, res) => {
        if (err) {
          console.error("END_GAME - DB update error:", err);
          socket.emit("end_result", {
            success: false,
            message: "DB update failed",
          });
          return;
        }

        // Broadcast ke semua socket yang sudah join room -> beri tahu game berakhir
        io.to(String(id_room)).emit("game_ended", { id_room: String(id_room) });
        socket.emit("end_result", { success: true });

        // optional: disconnect semua sockets di room supaya "keluar semua sesi"
        io.in(String(id_room))
          .fetchSockets()
          .then((sockets) => {
            sockets.forEach((s) => {
              try {
                s.disconnect(true);
              } catch (e) {
                /* ignore */
              }
            });
          })
          .catch((e) => console.error("fetchSockets error:", e));

        console.log(
          `Room ${id_room} set to selesai and game_ended broadcasted`
        );
      }
    );
  });
});

server.listen(3000, () => {
  console.log("Socket.io server running on port 3000");
});
