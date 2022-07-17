; PDDL Domain Description. 
;   The goal is to move authorities units between different locations to tackle weather events there efficiently.
;   If there are no events anymore at a location, units should move back to the hub (e.g. to re-fuel and re-equip).

(define (domain weather-events-action-planning)

    (:requirements :strips :typing :equality :negative-preconditions)

    (:types
        location unit weathereventtype - object
    )

    ; un-comment following line if constants are needed
    ;(:constants )

    (:predicates
        (is-hub ?l - location)
        (is-weatherevent-at ?w - weathereventtype ?l - location)
        (needs-police-car-at ?l - location)
        (needs-fire-truck-at ?l - location)
        (needs-ambulance-at ?l - location)
        (is-unit-operating ?u - unit)
        (is-police-car-operating-at ?l - location)
        (is-fire-truck-operating-at ?l - location)
        (is-ambulance-operating-at ?l - location)
        (is-unit-at ?u - unit ?l - location)
        (is-police-car ?u - unit)
        (is-fire-truck ?u - unit)
        (is-ambulance ?u - unit)
        (unit-performed-action ?u - unit)
    )

    (:action move-to-event-location
        :parameters (?unit - unit ?from - location ?to - location ?eventtype - weathereventtype)
        :precondition (and
            (is-unit-at ?unit ?from)
            (is-weatherevent-at ?eventtype ?to)
            (not (is-unit-operating ?unit))
        )
        :effect (and
            (not (is-unit-at ?unit ?from))
            (is-unit-at ?unit ?to)
        )
    )

    (:action perform-police-action
        :parameters (?unit - unit ?eventtype - weathereventtype ?location - location)
        :precondition (and
            (is-unit-at ?unit ?location)
            (is-police-car ?unit)
            (not (unit-performed-action ?unit))
            (not (is-unit-operating ?unit))
            (is-weatherevent-at ?eventtype ?location)
            (needs-police-car-at ?location)
        )
        :effect (and
            (is-unit-operating ?unit)
            (unit-performed-action ?unit)
            (is-police-car-operating-at ?location)
        )
    )

    (:action perform-fire-truck-action
        :parameters (?unit - unit ?eventtype - weathereventtype ?location - location)
        :precondition (and
            (is-unit-at ?unit ?location)
            (is-fire-truck ?unit)
            (not (is-unit-operating ?unit))
            (not (unit-performed-action ?unit))
            (is-weatherevent-at ?eventtype ?location)
            (needs-fire-truck-at ?location)
        )
        :effect (and
            (is-unit-operating ?unit)
            (unit-performed-action ?unit)
            (is-fire-truck-operating-at ?location)
        )
    )

    (:action perform-ambulance-action
        :parameters (?unit - unit ?eventtype - weathereventtype ?location - location)
        :precondition (and
            (is-unit-at ?unit ?location)
            (is-ambulance ?unit)
            (not (is-unit-operating ?unit))
            (not (unit-performed-action ?unit))
            (is-weatherevent-at ?eventtype ?location)
            (needs-ambulance-at ?location)
        )
        :effect (and
            (is-unit-operating ?unit)
            (unit-performed-action ?unit)
            (is-ambulance-operating-at ?location)
        )
    )

    (:action return-to-hub
        :parameters (?unit - unit ?from - location ?to - location)
        :precondition (and
            (is-unit-at ?unit ?from)
            (not (is-hub ?from))
            (is-hub ?to)
            (not (is-unit-operating ?unit))
        )
        :effect (and
            (not (is-unit-at ?unit ?from))
            (is-unit-at ?unit ?to)
        )
    )

    (:action refuel-and-reequip-at-hub
        :parameters (?u - unit ?l - location)
        :precondition (and
            (is-unit-at ?u ?l)
            (is-hub ?l)
            (not (unit-performed-action ?u))
        )
        :effect (and
            (unit-performed-action ?u)
        )
    )

)