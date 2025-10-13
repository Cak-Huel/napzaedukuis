<?php
if (!isset($conn)) {
    include '../sekret.php'; // Panggil koneksi jika belum ada
}

// ----------------------------------------------------
// A. FORMULIR TAMBAH SOAL (Menggunakan form.php lama)
// ----------------------------------------------------
include '../soal/form.php'; 
echo '<hr>'; 

// ----------------------------------------------------
// B. DAFTAR SOAL UNTUK EDIT/HAPUS
// ----------------------------------------------------
$soal_query = mysqli_query($conn, "SELECT id_soal as id, lvl, pertanyaan, gambar FROM soal ORDER BY lvl ASC, id ASC");
?>

<h3>Daftar Soal Tersedia</h3>

<div class="soal-list-container">
    <?php if (mysqli_num_rows($soal_query) > 0): ?>
        <table class="soal-table">
            <thead>
                <tr>
                    <th>Level</th>
                    <th>Pertanyaan</th>
                    <th>Gambar?</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                <?php while ($soal = mysqli_fetch_assoc($soal_query)): ?>
                <tr>
                    <td><?= $soal['lvl'] ?></td>
                    <td><?= htmlspecialchars(substr($soal['pertanyaan'], 0, 50)) ?>...</td>
                    <td><?= $soal['gambar'] ? '✔️' : '❌' ?></td>
                    <td>
                        <a href="?menu=edit&id=<?= $soal['id'] ?>" class="btn-aksi btn-edit">Edit</a>
                        <a href="../soal/hapus_soal.php?id=<?= $soal['id'] ?>" class="btn-aksi btn-delete" onclick="return confirm('Yakin ingin menghapus soal ini?');">Hapus</a>
                    </td>
                </tr>
                <?php endwhile; ?>
            </tbody>
        </table>
    <?php else: ?>
        <p>Belum ada soal yang tersimpan di database.</p>
    <?php endif; ?>
</div>