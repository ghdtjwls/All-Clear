package opensource.project.domain;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "priority")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Priority
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "det_id", nullable = false)
    private Detection detection;

    // Person 기준으로 우선순위 평가
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_id", nullable = false)
    private Person person;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loc_id", nullable = false)
    private Location location;

    @Column(nullable = false)
    private Float value; // 가중치 계산 결과 값

    @Column
    private String used_factor; // 적용된 가중치 요인

    @Column(length = 30)
    private Status status; // 진행 상황(대기, 진행, 완료)
}


