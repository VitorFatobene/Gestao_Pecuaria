package gestao.pecuaria.backend.pesagem;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class PesagemInicialBackfillMigrationTest {

    @Test
    void deveCriarPesoInicialSomenteParaAnimalSemHistorico() throws Exception {
        String url = "jdbc:h2:mem:pesagem_backfill_" + System.nanoTime()
                + ";MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1";
        Flyway.configure().dataSource(url, "sa", "").locations("classpath:db/migration").target("13").load().migrate();

        try (Connection connection = DriverManager.getConnection(url, "sa", "")) {
            long usuarioId = inserirUsuario(connection);
            long semHistorico = inserirAnimal(connection, usuarioId, 9201L, new BigDecimal("300.00"));
            long comHistorico = inserirAnimal(connection, usuarioId, 9202L, new BigDecimal("330.00"));
            inserirPesagem(connection, comHistorico, new BigDecimal("300.00"), LocalDate.of(2026, 9, 15));
            inserirPesagem(connection, comHistorico, new BigDecimal("330.00"), LocalDate.of(2026, 10, 15));

            Flyway.configure().dataSource(url, "sa", "").locations("classpath:db/migration").load().migrate();

            assertThat(contarPesagens(connection, semHistorico)).isEqualTo(1);
            assertThat(pesoDaPesagem(connection, semHistorico)).isEqualByComparingTo("300.00");
            assertThat(contarPesagens(connection, comHistorico)).isEqualTo(2);
        }
    }

    private long inserirUsuario(Connection connection) throws Exception {
        try (PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO usuario (nome, email, senha, role) VALUES (?, ?, ?, ?)",
                PreparedStatement.RETURN_GENERATED_KEYS)) {
            statement.setString(1, "Usuário teste");
            statement.setString(2, "backfill@teste.com");
            statement.setString(3, "senha");
            statement.setString(4, "USER");
            statement.executeUpdate();
            return generatedId(statement);
        }
    }

    private long inserirAnimal(Connection connection, long usuarioId, long codigo, BigDecimal peso) throws Exception {
        try (PreparedStatement statement = connection.prepareStatement("""
                INSERT INTO animal (codigo_animal, raca, sexo, peso_kg, valor_pago, valor_frete,
                                    nome_vendedor, data_compra, status, usuario_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, PreparedStatement.RETURN_GENERATED_KEYS)) {
            statement.setLong(1, codigo);
            statement.setString(2, "Nelore");
            statement.setString(3, "MACHO");
            statement.setBigDecimal(4, peso);
            statement.setBigDecimal(5, BigDecimal.ZERO);
            statement.setBigDecimal(6, BigDecimal.ZERO);
            statement.setString(7, "Fazenda Teste");
            statement.setObject(8, LocalDate.of(2026, 10, 15));
            statement.setString(9, "ATIVO");
            statement.setLong(10, usuarioId);
            statement.executeUpdate();
            return generatedId(statement);
        }
    }

    private void inserirPesagem(Connection connection, long animalId, BigDecimal peso, LocalDate data) throws Exception {
        try (PreparedStatement statement = connection.prepareStatement(
                "INSERT INTO pesagem_animal (animal_id, peso_kg, data_pesagem) VALUES (?, ?, ?)")) {
            statement.setLong(1, animalId);
            statement.setBigDecimal(2, peso);
            statement.setObject(3, data);
            statement.executeUpdate();
        }
    }

    private int contarPesagens(Connection connection, long animalId) throws Exception {
        try (PreparedStatement statement = connection.prepareStatement(
                "SELECT COUNT(*) FROM pesagem_animal WHERE animal_id = ?")) {
            statement.setLong(1, animalId);
            try (ResultSet result = statement.executeQuery()) {
                result.next();
                return result.getInt(1);
            }
        }
    }

    private BigDecimal pesoDaPesagem(Connection connection, long animalId) throws Exception {
        try (PreparedStatement statement = connection.prepareStatement(
                "SELECT peso_kg FROM pesagem_animal WHERE animal_id = ?")) {
            statement.setLong(1, animalId);
            try (ResultSet result = statement.executeQuery()) {
                result.next();
                return result.getBigDecimal(1);
            }
        }
    }

    private long generatedId(PreparedStatement statement) throws Exception {
        try (ResultSet keys = statement.getGeneratedKeys()) {
            keys.next();
            return keys.getLong(1);
        }
    }
}
