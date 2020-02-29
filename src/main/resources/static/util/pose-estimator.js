class PoseEstimator {
  constructor(buffer = 200, estimateCount = 20, estimateScore = 0.7, distanceLimit = 20, confidenceLimit = 0.5) {
    this.scores = new Array(buffer);
    this.buffer = buffer;
    this.estimateCount = estimateCount;
    this.estimateScore = estimateScore;
    this.distanceLimit = distanceLimit;
    this.confidenceLimit = confidenceLimit;
  }

  addScore(score) {
    this.scores.pop();
    this.scores.unshift(score);
  }

  estimate(original, compare) {
    const overConfidence = this.overConfidence;
    const confidenceLimit = this.confidenceLimit;
    let originalMap = this.createPartToPositionMap(original, overConfidence, confidenceLimit);
    let compareMap = this.createPartToPositionMap(compare, overConfidence, confidenceLimit);
    const calculateDistance = this.calculateDistance;

    const distances = Array.from(originalMap.keys())
                           .map(part => calculateDistance(originalMap.get(part), compareMap.get(part)));

    console.log('distances: ', distances);
    const distanceLimit = this.distanceLimit;
    const validDistances = distances.filter(distance => distance <= distanceLimit);

    this.addScore(validDistances.length / distances.length)
  }

  createPartToPositionMap(keyPoints, overConfidence, confidenceLimit) {
    return keyPoints.filter(keyPoint => overConfidence(keyPoint, confidenceLimit)).reduce(function (map, keyPoint) {
      map.set(keyPoint.part, keyPoint.position);
      return map;
    }, new Map());
  }

  overConfidence(keyPoint, confidenceLimit) {
    return keyPoint.score >= confidenceLimit;
  }

  calculateDistance(original, compare) {
    if (!original || !compare) {
      return Number.MAX_VALUE;
    }

    let disX = original.x - compare.x;
    let disY = original.y - compare.y;

    return Math.sqrt(Math.abs(disX * disX) + Math.abs(disY * disY));
  }

  isSimilar() {
    const targets = this.scores
                        .slice(0, this.estimateCount)
                        .filter(this.isNumber);

    const targetAverage = targets.reduce(this.sum, 0) / targets.length;

    return targetAverage >= this.estimateScore;
  }

  isNumber(score) {
    return score !== null && score !== undefined && typeof score === 'number';
  }

  sum(a, b) {
    return a + b
  }
}