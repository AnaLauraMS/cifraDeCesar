package br.com.fatec.poneglyph_api.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "cipher")
public class Cipher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //hash único que o usuário usará para descriptografar (nosso "Log Pose")
    @Column(nullable = false, unique = true)
    private String hashKey;

    //número de casas que a mensagem foi deslocada
    @Column(nullable = false)
    private Integer step;

    //garantir que o hash seja usado uma única vez
    @Column(nullable = false)
    private Boolean used = false;
}
