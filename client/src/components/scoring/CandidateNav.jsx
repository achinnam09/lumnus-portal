import "./CandidateNav.css";

const CandidateNav = ({ candidates, currentIndex, onPrev, onNext, onAdd, onRemove }) => {
  const total = candidates.length;
  const current = candidates[currentIndex];
  const displayName = current?.validated ? current.name : "New Candidate";

  return (
    <div className="candidate-nav">
      <button
        type="button"
        className="candidate-nav__arrow"
        disabled={currentIndex === 0}
        onClick={onPrev}
        aria-label="Previous candidate"
      >
        &larr;
      </button>

      <span className="candidate-nav__label">
        {current?.validated && <span className="candidate-nav__dot" />}
        Candidate {currentIndex + 1} of {total}: {displayName}
      </span>

      <button
        type="button"
        className="candidate-nav__arrow"
        disabled={currentIndex === total - 1}
        onClick={onNext}
        aria-label="Next candidate"
      >
        &rarr;
      </button>

      <button
        type="button"
        className="candidate-nav__add"
        onClick={onAdd}
      >
        + Add
      </button>

      <button
        type="button"
        className="candidate-nav__remove"
        disabled={total === 1}
        onClick={onRemove}
      >
        - Remove
      </button>
    </div>
  );
};

export default CandidateNav;
