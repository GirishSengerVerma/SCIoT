; PDDL Domain Description. 
;   The goal is to enable actuators for lowering the risk of a weather event at certain locations and to
;   move authorities units between different locations to tackle weather events there in the most efficient way.
;   If there are no events anymore at a location, units should move back to the hub to re-fuel and re-equip.

(define (domain weather-events-action-planning)

    ; TODO remove requirements that are not needed
    (:requirements :strips :fluents :durative-actions :timed-initial-literals :typing :conditional-effects :negative-preconditions :duration-inequalities :equality :disjunctive-preconditions)

    (:types
        location unit fuel equipment weathereventtype weathereventrisk - object
    )

    ; un-comment following line if constants are needed
    ;(:constants )

    (:predicates
        (is-hub ?l - location)
        (has-alarm-light-at ?l - location)
        (has-alarm-sound-at ?l - location)
        (has-water-protection-wall-at ?l - location)
        (can-lock-down-at ?l - location)
        (alarm-light-enabled-at ?l - location)
        (alarm-sound-enabled-at ?l - location)
        (water-protection-wall-enabled-at ?l - location)
        (lockdown-enabled-at ?l - location)
        (is-weatherevent-at ?w - weathereventtype ?l - location)
        (is-unit-operating ?u - unit)
        (is-unit-at ?u - unit ?l - location)
        (is-related-to-water ?w - weathereventtype)
        (is-police-car ?u - unit)
        (is-fire-truck ?u - unit)
        (is-ambulance ?u - unit)
        (needs-police-car-in-case-of ?w - weathereventtype ?l - location)
        (needs-fire-truck-in-case-of ?w - weathereventtype ?l - location)
        (needs-ambulance-in-case-of ?w - weathereventtype ?l - location)
    )

    (:functions
        (current-risk ?w - weathereventtype ?l - location)
        (current-fuel-level ?u - unit)
        (max-fuel-level ?u - unit)
        (fuel-needed-for-move ?l1 - location ?l2 - location)
        (current-equipment-level ?u - unit)
        (max-equipment-level ?u - unit)
        (equipment-needed-for-action ?w - weathereventtype ?r - weathereventrisk)
    )

    (:action alarm-locals-by-light
        :parameters (?l - location ?w - weathereventtype)
        :precondition (and
            (has-alarm-light-at ?l)
            (not (alarm-light-enabled-at ?l))
            (is-weatherevent-at ?w ?l)
            (>= (current-risk ?w ?l) 2) ; only at medium risk plus
        )
        :effect (and
            (alarm-light-enabled-at ?l)
            (decrease (current-risk ?w ?l) 0.5)
        )
    )

    (:action alarm-locals-by-sound
        :parameters (?l - location ?w - weathereventtype)
        :precondition (and
            (has-alarm-sound-at ?l)
            (not (alarm-sound-enabled-at ?l))
            (is-weatherevent-at ?w ?l)
            (>= (current-risk ?w ?l) 2) ; only at medium risk plus
        )
        :effect (and
            (alarm-light-enabled-at ?l)
            (decrease (current-risk ?w ?l) 0.5)
        )
    )

    (:action drive-up-water-protection-wall
        :parameters (?l - location ?w - weathereventtype)
        :precondition (and
            (has-water-protection-wall-at ?l)
            (not (water-protection-wall-enabled-at ?l))
            (is-weatherevent-at ?w ?l)
            (is-related-to-water ?w)
            (>= (current-risk ?w ?l) 2) ; only at medium risk plus
        )
        :effect (and
            (water-protection-wall-enabled-at ?l)
            (decrease (current-risk ?w ?l) 0.5)
        )
    )

    (:action lock-down-location
        :parameters (?l - location ?w - weathereventtype)
        :precondition (and
            (can-lock-down-at ?l ?l)
            (not (lockdown-enabled-at ?l))
            (is-weatherevent-at ?w ?l)
            (>= (current-risk ?w ?l) 4) ; only at extreme risk
        )
        :effect (and
            (lockdown-enabled-at ?l)
            (decrease (current-risk ?w ?l) 0.5)
        )
    )

    (:action move-to-event-location
        :parameters (?unit - unit ?from - location ?to - location ?fuellevel - fuel, ?eventtype - weathereventtype)
        :precondition (and
            (is-unit-at ?unit ?from)
            (is-weatherevent-at ?eventtype ?to)
            (>= (current-fuel-level ?unit) (fuel-needed-for-move ?from ?to))
            (or
                (and
                    (is-police-car ?unit)
                    (needs-police-car-in-case-of ?eventtype ?to)
                )
                (and
                    (is-fire-truck ?unit)
                    (needs-fire-truck-in-case-of ?eventtype ?to)
                )
                (and
                    (is-ambulance ?unit)
                    (needs-ambulance-in-case-of ?eventtype ?to)
                )
            )
        )
        :effect (and
            (not (is-unit-at ?unit ?from))
            (is-unit-at ?unit ?to)
            (decrease
                (current-fuel-level ?unit)
                (fuel-needed-for-move ?from ?to))
        )
    )

    (:action perform-police-action
        :parameters (?unit - unit ?eventtype - weathereventtype ?location - location)
        :precondition (and
            (is-unit-at ?unit ?location)
            (is-police-car ?unit)
            (not (is-unit-operating ?unit))
            (is-weatherevent-at ?eventtype ?location)
            (needs-police-car-in-case-of ?eventtype ?location)
            (>= (current-risk ?eventtype ?location) 1)
        )
        :effect (and
            (is-unit-operating ?unit)
            (decrease
                (current-risk ?eventtype ?location)
                (* (current-risk ?eventtype ?location) 0.5))
        )
    )

    (:action perform-fire-truck-action
        :parameters (?unit - unit ?eventtype - weathereventtype ?location - location)
        :precondition (and
            (is-unit-at ?unit ?location)
            (is-fire-truck ?unit)
            (not (is-unit-operating ?unit))
            (is-weatherevent-at ?eventtype ?location)
            (needs-fire-truck-in-case-of ?eventtype ?location)
            (>= (current-risk ?eventtype ?location) 1)
        )
        :effect (and
            (is-unit-operating ?unit)
            (decrease
                (current-risk ?eventtype ?location)
                (* (current-risk ?eventtype ?location) 0.5))
        )
    )

    (:action perform-ambulance-action
        :parameters (?unit - unit ?eventtype - weathereventtype ?location - location)
        :precondition (and
            (is-unit-at ?unit ?location)
            (is-ambulance ?unit)
            (not (is-unit-operating ?unit))
            (is-weatherevent-at ?eventtype ?location)
            (needs-ambulance-in-case-of ?eventtype ?location)
            (>= (current-risk ?eventtype ?location) 1)
        )
        :effect (and
            (is-unit-operating ?unit)
            (decrease
                (current-risk ?eventtype ?location)
                (* (current-risk ?eventtype ?location) 0.5))
        )
    )

    (:action return-to-hub
        :parameters (?unit - unit ?from - location ?to - location)
        :precondition (and
            (not (is-hub ?from))
            (is-hub ?to)
            (not (is-unit-operating ?unit))
            (not (exists
                    (?w - weathereventtype)
                    (and
                        (is-weatherevent-at ?w ?from)
                        (>= (current-risk ?w ?from) 1)
                        (or
                            (and
                                (is-police-car ?unit)
                                (needs-police-car-in-case-of ?w ?from)
                            )
                            (and
                                (is-fire-truck ?unit)
                                (needs-fire-truck-in-case-of ?w ?from)
                            )
                            (and
                                (is-ambulance ?unit)
                                (needs-ambulance-in-case-of ?w ?from)
                            )
                        )
                    )
                )
            )
        )
        :effect (and
            (not (is-unit-at ?unit ?from))
            (is-unit-at ?unit ?to)
            (decrease
                (current-fuel-level ?unit)
                (fuel-needed-for-move ?from ?to))
        )
    )

    (:action re-fuel
        :parameters (?unit - unit ?location - location)
        :precondition (and
            (is-unit-at ?unit ?location)
            (is-hub ?location)
            (not (= (current-fuel-level ?unit) (max-fuel-level ?unit)))
        )
        :effect (and
            (assign
                (current-fuel-level ?unit)
                (max-fuel-level ?unit))
        )
    )

    (:action re-equip
        :parameters (?unit - unit ?location - location)
        :precondition (and
            (is-unit-at ?unit ?location)
            (is-hub ?location)
            (not (= (current-equipment-level ?unit) (max-equipment-level ?unit)))
        )
        :effect (and
            (assign
                (current-equipment-level ?unit)
                (max-equipment-level ?unit))
        )
    )
)