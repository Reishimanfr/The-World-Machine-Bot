import moment from 'moment'

class TimeFormatter {
  /**
   * Formats seconds into MM:SS or HH:MM:SS depending on if hours > 0
   */
  public duration(seconds: number) {
    return moment.utc(seconds * 1000).format((seconds < 3600) ? 'mm:ss': 'HH:mm:ss')
  } 

  /**
   * Formats seconds into "X hours, Y minutes, Z seconds"
   */
  public detailedDuration(seconds: number) {
    return moment.utc(seconds * 1000).format('H [hours,] m [minutes,] s [seconds]');
  }

  public uptime(seconds: number) {
    const days = Math.floor(seconds / (60 * 60 * 24));
    const remainingSeconds = seconds % (60 * 60 * 24);
    const fractionOfDay = remainingSeconds / (60 * 60 * 24);
    const formattedFraction = fractionOfDay.toFixed(2).substring(1); // Keeps only the decimal part with two digits after the dot
    
    const daysString = days > 0 ? days.toString() : '';
    const fractionString = formattedFraction !== '00' ? `.${formattedFraction.substring(1)}` : '';
    
    return `${daysString}${fractionString} days`;
  }
}

export { TimeFormatter }