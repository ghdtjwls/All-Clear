package opensource.project.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "person")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Person
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "det_id")
    private Detection detection;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loc_id")
    private Location location;

    @Column
    private Integer person_index;

    @Column(columnDefinition = "TEXT")
    private String individual_caption;

    @Column
    private Float dwell;

    @Column
    private Float speed;

}

